import Modal from '../../components/Modal.jsx'
import { useArchive } from './useArchive.js'

const SOURCE_LABEL = { housing: '🏠 집', car: '🚗 차' }

/**
 * 스크랩 보관함 모달 (PRD F-07).
 * 데일리 피드에서 📌 저장한 항목들을 누적 열람하고 삭제한다.
 */
export default function ArchiveModal({ open, onClose }) {
  const { items, loading, remove } = useArchive(open)

  return (
    <Modal open={open} onClose={onClose} title="📌 스크랩 보관함" maxWidth="max-w-2xl">
      {loading ? (
        <p className="text-base text-muted">…</p>
      ) : items.length === 0 ? (
        <p className="text-base text-muted">
          아직 저장한 항목이 없습니다. 집·차 카드의 [📌 보관함 저장] 으로 모아보세요.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => {
            const s = it.snapshot ?? {}
            return (
              <li key={it.id} className="rounded-xl bg-base p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-base font-medium text-soft">
                    {SOURCE_LABEL[s.source] ?? s.source ?? '항목'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-muted">
                      {it.saved_at && new Date(it.saved_at).toLocaleDateString('ko-KR')}
                    </span>
                    <button
                      onClick={() => remove(it.id)}
                      className="btn min-h-0 min-w-0 bg-transparent px-2 py-1 text-muted hover:text-red-400"
                      aria-label="삭제"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <p className="text-base text-soft">{s.summary}</p>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
