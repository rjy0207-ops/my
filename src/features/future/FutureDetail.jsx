import { useEffect, useState } from 'react'
import { STATUS, STATUS_LABEL, dday, ddayLabel } from './useFuture.js'

/**
 * 나의 미래 상세 편집 (모달 내부).
 * 커리어 이벤트 CRUD + 이력서 편집.
 */
export default function FutureDetail({ data }) {
  const { events, resume, addEvent, updateEvent, removeEvent, seedRoadmap, saveResume } = data
  const [resumeText, setResumeText] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setResumeText(resume?.content?.text ?? '')
  }, [resume])

  return (
    <div className="space-y-8">
      {/* ── 커리어 타임라인 ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-future">커리어 타임라인</h3>
          <div className="flex gap-2">
            {events.length === 0 && (
              <button
                className="btn min-h-0 bg-future/20 px-3 py-1 text-future hover:bg-future/30"
                onClick={seedRoadmap}
              >
                기본 로드맵 불러오기
              </button>
            )}
            <button
              className="btn min-h-0 bg-future/20 px-3 py-1 text-future hover:bg-future/30"
              onClick={() => addEvent({})}
            >
              + 일정
            </button>
          </div>
        </div>

        <ul className="space-y-2">
          {events.map((e) => {
            const d = dday(e.event_date)
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-base p-3">
                <select
                  value={e.status}
                  onChange={(ev) => updateEvent(e.id, { status: ev.target.value })}
                  className="rounded-lg bg-card px-2 py-2 text-base text-soft"
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <input
                  value={e.title}
                  onChange={(ev) => updateEvent(e.id, { title: ev.target.value })}
                  className="min-w-[10rem] flex-1 rounded-lg bg-card px-3 py-2 text-base text-soft"
                  placeholder="일정명"
                />
                <input
                  type="date"
                  value={e.event_date ?? ''}
                  onChange={(ev) => updateEvent(e.id, { event_date: ev.target.value })}
                  className="rounded-lg bg-card px-3 py-2 text-base text-soft"
                />
                {d !== null && d >= 0 && (
                  <span className="text-base font-semibold text-future">{ddayLabel(d)}</span>
                )}
                <button
                  onClick={() => removeEvent(e.id)}
                  className="btn min-h-0 min-w-0 bg-transparent px-2 py-1 text-muted hover:text-red-400"
                  aria-label="삭제"
                >
                  🗑
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── 이력서 ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-future">이력서</h3>
          <button
            className="btn min-h-0 bg-future/20 px-3 py-1 text-future hover:bg-future/30"
            onClick={async () => {
              await saveResume(resumeText)
              setSaved(true)
              setTimeout(() => setSaved(false), 1500)
            }}
          >
            {saved ? '저장됨 ✓' : '저장'}
          </button>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={8}
          placeholder="핵심 성과 / 프로젝트 / 경력을 자유롭게 기록하세요."
          className="w-full rounded-lg bg-base px-3 py-2 text-base text-soft"
        />
      </div>
    </div>
  )
}
