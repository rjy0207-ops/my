import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard.jsx'
import Modal from '../../components/Modal.jsx'
import { useAssets } from './useAssets.js'

const fmt = new Intl.NumberFormat('ko-KR')

function won(value) {
  return `${fmt.format(Number(value) || 0)}원`
}

function compactWon(value) {
  const n = Number(value) || 0
  if (Math.abs(n) >= 100000000) return `${(n / 100000000).toFixed(1)}억`
  if (Math.abs(n) >= 10000) return `${Math.round(n / 10000).toLocaleString('ko-KR')}만`
  return won(n)
}

export default function AssetCard() {
  const data = useAssets()
  const { summary, cashflow, loading, error, addCashflow } = data
  const [draft, setDraft] = useState({ category: '수입', label: '', amount: '' })

  const totalAsset = summary.totalAsset || 485000000
  const totalLiability = summary.totalLiability || 92500000
  const netWorth = summary.netWorth || totalAsset - totalLiability
  const debtRatio = Math.min(100, Math.round((totalLiability / totalAsset) * 100))

  async function addTransaction(event) {
    event.preventDefault()
    const amount = Number(draft.amount)
    if (!draft.label || Number.isNaN(amount)) return
    await addCashflow({
      category: draft.category,
      label: draft.label,
      amount: draft.category === '지출' ? Math.abs(amount) : amount,
    })
    setDraft({ category: '수입', label: '', amount: '' })
  }

  return (
    <>
      <DashboardCard accent="asset" title="나의 자산" icon="💰">
        {error && <p className="text-base text-red-400">오류: {error}</p>}

        <button
          type="button"
          onClick={() => {
            window.location.hash = '/finance'
          }}
          className="block w-full text-left"
          aria-label="정밀 재무 분석 열기"
        >
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <AssetSnapshot totalAsset={totalAsset} totalLiability={totalLiability} />

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-muted">총자산</p>
                <p className="mt-1 break-keep text-[34px] font-black leading-tight text-asset">
                  {loading ? '계산 중' : won(totalAsset)}
                </p>
                <p className="mt-3 rounded-xl bg-base/70 p-3 text-sm font-semibold leading-relaxed text-soft">
                  AI 리뷰: 꺾은선보다 자산 구성과 부채 비율을 먼저 보는 편이 현재 상태 판단에 더 좋습니다.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="총부채" value={compactWon(totalLiability)} tone="text-red-300" />
                <Metric label="순자본" value={compactWon(netWorth)} tone="text-sky-300" />
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs font-semibold text-muted">
                  <span>부채 비율</span>
                  <span>{debtRatio}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-base">
                  <div className="h-full rounded-full bg-asset" style={{ width: `${100 - debtRatio}%` }} />
                </div>
              </div>
            </div>
          </div>
        </button>
      </DashboardCard>

      <Modal open={false} onClose={() => {}} title="정밀 재무 분석" maxWidth="max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl bg-base p-4">
            <h3 className="mb-4 text-sub font-semibold text-asset">자산 구성 분석</h3>
            <AssetSnapshot totalAsset={totalAsset} totalLiability={totalLiability} large />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Metric label="총자산" value={compactWon(totalAsset)} />
              <Metric label="총부채" value={compactWon(totalLiability)} tone="text-red-300" />
              <Metric label="순자본" value={compactWon(netWorth)} tone="text-sky-300" />
            </div>
          </section>

          <section className="rounded-xl bg-base p-4">
            <h3 className="mb-4 text-sub font-semibold text-asset">거래 내역 수동 추가</h3>
            <form onSubmit={addTransaction} className="grid gap-2">
              <div className="grid grid-cols-[96px_1fr] gap-2">
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="rounded-lg bg-card px-3 py-2 text-base text-soft"
                >
                  <option>수입</option>
                  <option>지출</option>
                  <option>투자</option>
                </select>
                <input
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="거래 메모"
                  className="rounded-lg bg-card px-3 py-2 text-base text-soft"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="number"
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                  placeholder="금액"
                  className="rounded-lg bg-card px-3 py-2 text-base text-soft"
                />
                <button className="btn bg-asset/20 text-asset hover:bg-asset/30">추가</button>
              </div>
            </form>

            <ul className="mt-4 space-y-2">
              {cashflow.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl bg-card p-3">
                  <span className="min-w-0 truncate text-soft">{item.label}</span>
                  <span className="shrink-0 font-bold text-asset">{compactWon(item.amount)}</span>
                </li>
              ))}
              {cashflow.length === 0 && (
                <li className="rounded-xl bg-card p-3 text-muted">아직 거래 내역이 없습니다.</li>
              )}
            </ul>
          </section>
        </div>
      </Modal>
    </>
  )
}

function AssetSnapshot({ totalAsset, totalLiability, large = false }) {
  const net = Math.max(0, totalAsset - totalLiability)
  const buckets = [
    { label: '순자본', value: net, color: 'bg-asset', width: Math.max(12, (net / totalAsset) * 100) },
    {
      label: '부채',
      value: totalLiability,
      color: 'bg-red-400',
      width: Math.max(8, (totalLiability / totalAsset) * 100),
    },
  ]
  const sample = [
    { label: '주거/부동산', value: 58, color: 'bg-emerald-400' },
    { label: '주식/ETF', value: 24, color: 'bg-sky-400' },
    { label: '현금성', value: 12, color: 'bg-amber-300' },
    { label: '기타', value: 6, color: 'bg-violet-400' },
  ]

  return (
    <div className={`rounded-xl bg-base/70 p-4 ${large ? '' : 'min-h-[205px]'}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">자산 건강판</span>
        <span className="rounded-full bg-asset/15 px-2 py-0.5 text-xs font-bold text-asset">추천 뷰</span>
      </div>

      <div className="overflow-hidden rounded-full bg-card">
        <div className="flex h-5">
          {buckets.map((item) => (
            <div key={item.label} className={item.color} style={{ width: `${item.width}%` }} />
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold text-muted">
        <span>순자본 {compactWon(net)}</span>
        <span>부채 {compactWon(totalLiability)}</span>
      </div>

      <div className="mt-5 space-y-3">
        {sample.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs font-semibold text-soft">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-card">
              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Metric({ label, value, tone = 'text-soft' }) {
  return (
    <div className="rounded-xl bg-card p-3">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={`mt-1 text-base font-bold ${tone}`}>{value}</p>
    </div>
  )
}
