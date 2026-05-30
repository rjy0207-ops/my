import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard.jsx'
import Modal from '../../components/Modal.jsx'
import { useFuture, dday, ddayLabel, STATUS_LABEL } from './useFuture.js'
import FutureDetail from './FutureDetail.jsx'

/**
 * 나의 미래 카드 (PRD F-05).
 * 가장 가까운 미래 일정의 디데이를 크게 보여주고,
 * 타임라인 미리보기 + [상세 · 편집] 모달을 제공한다.
 */
export default function FutureCard() {
  const data = useFuture()
  const { events, nextEvent, loading, backend } = data
  const [open, setOpen] = useState(false)

  return (
    <>
      <DashboardCard accent="future" title="나의 미래" icon="🚀">
        {/* 핵심: 다음 일정 디데이 (28px Bold) */}
        <div className="mb-4">
          {loading ? (
            <p className="text-base text-muted">…</p>
          ) : nextEvent ? (
            <>
              <p className="text-base text-muted">{nextEvent.title}</p>
              <p className="text-metric font-bold text-future">
                {ddayLabel(nextEvent.diff)}
              </p>
              <p className="text-base text-muted">{nextEvent.event_date}</p>
            </>
          ) : (
            <p className="text-base text-muted">
              예정된 일정이 없습니다. 편집에서 로드맵을 불러오세요.
            </p>
          )}
        </div>

        {/* 타임라인 미리보기 */}
        {events.length > 0 && (
          <ul className="space-y-1">
            {events.slice(0, 4).map((e) => {
              const d = dday(e.event_date)
              return (
                <li key={e.id} className="flex items-center gap-2 text-base">
                  <span className="w-10 shrink-0 text-muted">{STATUS_LABEL[e.status]}</span>
                  <span className="truncate text-soft">{e.title}</span>
                  {d !== null && d >= 0 && (
                    <span className="ml-auto shrink-0 text-future">{ddayLabel(d)}</span>
                  )}
                </li>
              )
            })}
            {events.length > 4 && (
              <li className="text-base text-muted">+ {events.length - 4}개 더</li>
            )}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base text-muted">
            {backend === 'supabase' ? '☁️ 클라우드' : '💾 로컬'}
          </span>
          <button
            onClick={() => setOpen(true)}
            className="btn bg-future/20 text-future hover:bg-future/30"
          >
            상세 · 편집
          </button>
        </div>
      </DashboardCard>

      <Modal open={open} onClose={() => setOpen(false)} title="나의 미래 · 편집">
        <FutureDetail data={data} />
      </Modal>
    </>
  )
}
