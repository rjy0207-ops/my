import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard.jsx'
import Modal from '../../components/Modal.jsx'
import { ACCENT } from '../../lib/accent.js'
import { useCollection } from './useCollection.js'
import CollectionEditor from './CollectionEditor.jsx'

/**
 * 범용 컬렉션 카드 (투자·집·여행·차 공용, 3단계).
 * 카드 면에는 최근 항목 미리보기 + 개수를 보여주고,
 * [추가 · 편집] 으로 전체 CRUD 모달을 연다.
 */
export default function CollectionCard({ board, accent, title, icon, tags, emptyHint }) {
  const data = useCollection(board)
  const { items, loading, error, backend } = data
  const [open, setOpen] = useState(false)
  const preview = items.slice(0, 3)

  return (
    <>
      <DashboardCard accent={accent} title={title} icon={icon}>
        {error && <p className="text-base text-red-400">에러: {error}</p>}

        {loading ? (
          <p className="text-base text-muted">…</p>
        ) : items.length === 0 ? (
          <p className="text-base text-muted">{emptyHint}</p>
        ) : (
          <ul className="space-y-2">
            {preview.map((it) => (
              <li key={it.id} className="rounded-xl bg-base p-3">
                <div className="flex items-center gap-2">
                  {it.tag && (
                    <span className={`shrink-0 text-base ${ACCENT[accent].text}`}>
                      #{it.tag}
                    </span>
                  )}
                  <span className="truncate font-medium text-soft">{it.title}</span>
                </div>
                {it.body && (
                  <p className="mt-1 line-clamp-2 text-base text-muted">{it.body}</p>
                )}
              </li>
            ))}
            {items.length > 3 && (
              <li className="text-base text-muted">+ {items.length - 3}개 더</li>
            )}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base text-muted">
            {backend === 'supabase' ? '☁️ 클라우드' : '💾 로컬'} · {items.length}개
          </span>
          <button onClick={() => setOpen(true)} className={`btn ${ACCENT[accent].btn}`}>
            추가 · 편집
          </button>
        </div>
      </DashboardCard>

      <Modal open={open} onClose={() => setOpen(false)} title={`${title} · 편집`}>
        <CollectionEditor data={data} tags={tags} accent={accent} />
      </Modal>
    </>
  )
}
