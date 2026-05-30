import { useEffect } from 'react'

/**
 * 재사용 모달 (AI 리뷰 / 카드 상세 편집 등에 사용).
 * 배경 클릭 또는 ESC 로 닫힌다. 본문은 스크롤 가능.
 */
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center
        overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`mt-8 w-full ${maxWidth} rounded-2xl bg-card p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sub font-semibold text-soft">{title}</h2>
          <button
            onClick={onClose}
            className="btn min-h-0 min-w-0 bg-base px-3 py-1 text-muted hover:bg-slate-700"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
