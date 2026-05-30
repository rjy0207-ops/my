import { ACCENT } from '../../lib/accent.js'

/**
 * 범용 컬렉션 편집기 (모달 내부).
 * 항목(제목/태그/본문)을 추가·수정·삭제한다. 입력 즉시 저장.
 */
export default function CollectionEditor({ data, tags, accent }) {
  const { items, add, update, remove } = data
  const defaultTag = tags?.[0] ?? ''

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          className={`btn min-h-0 ${ACCENT[accent].btn}`}
          onClick={() => add({ tag: defaultTag })}
        >
          + 항목 추가
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-base text-muted">아직 항목이 없습니다. 추가해 보세요.</p>
      )}

      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="rounded-xl bg-base p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {tags && (
                <select
                  value={it.tag ?? defaultTag}
                  onChange={(e) => update(it.id, { tag: e.target.value })}
                  className="rounded-lg bg-card px-2 py-2 text-base text-soft"
                >
                  {tags.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              )}
              <input
                value={it.title}
                onChange={(e) => update(it.id, { title: e.target.value })}
                placeholder="제목"
                className="min-w-[10rem] flex-1 rounded-lg bg-card px-3 py-2 text-base text-soft"
              />
              <button
                onClick={() => remove(it.id)}
                className="btn min-h-0 min-w-0 bg-transparent px-2 py-1 text-muted hover:text-red-400"
                aria-label="삭제"
              >
                🗑
              </button>
            </div>
            <textarea
              value={it.body ?? ''}
              onChange={(e) => update(it.id, { body: e.target.value })}
              placeholder="메모 / 상세 내용"
              rows={2}
              className="w-full rounded-lg bg-card px-3 py-2 text-base text-soft"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
