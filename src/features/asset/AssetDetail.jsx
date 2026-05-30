import { ASSET_TYPES, CASHFLOW_CATEGORIES } from './useAssets.js'

/**
 * 자산 모듈 상세 편집 패널 (모달 내부, PRD F-01).
 * 자산/부채 항목과 자금 흐름 항목을 추가·수정·삭제한다.
 * 수정 시 즉시 repo(Supabase 또는 localStorage)에 반영.
 */
export default function AssetDetail({ data }) {
  const {
    assets,
    cashflow,
    addAsset,
    updateAsset,
    removeAsset,
    addCashflow,
    updateCashflow,
    removeCashflow,
  } = data

  return (
    <div className="space-y-8">
      {/* ── 자산 / 부채 ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-asset">자산 · 부채</h3>
          <div className="flex gap-2">
            <button
              className="btn min-h-0 bg-asset/20 px-3 py-1 text-asset hover:bg-asset/30"
              onClick={() => addAsset({ type: '현금', name: '새 자산', value: 0 })}
            >
              + 자산
            </button>
            <button
              className="btn min-h-0 bg-red-500/20 px-3 py-1 text-red-300 hover:bg-red-500/30"
              onClick={() =>
                addAsset({ type: '기타', name: '새 부채', value: 0, is_liability: true })
              }
            >
              + 부채
            </button>
          </div>
        </div>

        {assets.length === 0 && (
          <p className="text-base text-muted">아직 항목이 없습니다. 위 버튼으로 추가하세요.</p>
        )}

        <ul className="space-y-2">
          {assets.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center gap-2 rounded-xl bg-base p-3"
            >
              <select
                value={a.type}
                onChange={(e) => updateAsset(a.id, { type: e.target.value })}
                className="rounded-lg bg-card px-2 py-2 text-base text-soft"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                value={a.name}
                onChange={(e) => updateAsset(a.id, { name: e.target.value })}
                className="min-w-[8rem] flex-1 rounded-lg bg-card px-3 py-2 text-base text-soft"
                placeholder="항목명"
              />
              <input
                type="number"
                value={a.value}
                onChange={(e) => updateAsset(a.id, { value: Number(e.target.value) })}
                className="w-32 rounded-lg bg-card px-3 py-2 text-right text-base text-soft"
              />
              <label className="flex items-center gap-1 text-base text-muted">
                <input
                  type="checkbox"
                  checked={!!a.is_liability}
                  onChange={(e) => updateAsset(a.id, { is_liability: e.target.checked })}
                  className="h-5 w-5"
                />
                부채
              </label>
              <button
                onClick={() => removeAsset(a.id)}
                className="btn min-h-0 min-w-0 bg-transparent px-2 py-1 text-muted hover:text-red-400"
                aria-label="삭제"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 자금 흐름 ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-asset">자금 흐름 (월)</h3>
          <button
            className="btn min-h-0 bg-asset/20 px-3 py-1 text-asset hover:bg-asset/30"
            onClick={() => addCashflow({ category: '수입', label: '새 항목', amount: 0 })}
          >
            + 항목
          </button>
        </div>

        {cashflow.length === 0 && (
          <p className="text-base text-muted">월수입·고정비·보너스 활용 내역을 추가하세요.</p>
        )}

        <ul className="space-y-2">
          {cashflow.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-2 rounded-xl bg-base p-3"
            >
              <select
                value={c.category}
                onChange={(e) => updateCashflow(c.id, { category: e.target.value })}
                className="rounded-lg bg-card px-2 py-2 text-base text-soft"
              >
                {CASHFLOW_CATEGORIES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                value={c.label}
                onChange={(e) => updateCashflow(c.id, { label: e.target.value })}
                className="min-w-[8rem] flex-1 rounded-lg bg-card px-3 py-2 text-base text-soft"
                placeholder="항목명"
              />
              <input
                type="number"
                value={c.amount}
                onChange={(e) => updateCashflow(c.id, { amount: Number(e.target.value) })}
                className="w-32 rounded-lg bg-card px-3 py-2 text-right text-base text-soft"
              />
              <button
                onClick={() => removeCashflow(c.id)}
                className="btn min-h-0 min-w-0 bg-transparent px-2 py-1 text-muted hover:text-red-400"
                aria-label="삭제"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-right text-base text-muted">
          입력값은 즉시 저장됩니다 · 단위: 원(₩)
        </p>
      </div>
    </div>
  )
}
