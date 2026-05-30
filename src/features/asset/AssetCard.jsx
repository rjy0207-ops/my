import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard.jsx'
import Modal from '../../components/Modal.jsx'
import { krw, krwShort } from '../../lib/format.js'
import { useAssets } from './useAssets.js'
import AssetDetail from './AssetDetail.jsx'

/**
 * 자산 카드 (PRD F-01).
 * 카드 면에는 순자산/총자산/총부채/월 잉여 요약을 보여주고,
 * [상세 · 편집] 으로 전체 CRUD 모달을 연다.
 */
export default function AssetCard() {
  const data = useAssets()
  const { summary, loading, error, backend } = data
  const [open, setOpen] = useState(false)

  return (
    <>
      <DashboardCard accent="asset" title="자산" icon="💰">
        {error && <p className="text-base text-red-400">에러: {error}</p>}

        {/* 순자산 핵심 지표 (28px Bold) */}
        <div className="mb-4">
          <p className="text-base text-muted">순자산</p>
          <p className="text-metric font-bold text-asset">
            {loading ? '…' : krw(summary.netWorth)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-base">
          <div className="rounded-xl bg-base p-3">
            <p className="text-muted">총자산</p>
            <p className="font-semibold text-soft">{krwShort(summary.totalAsset)}</p>
          </div>
          <div className="rounded-xl bg-base p-3">
            <p className="text-muted">총부채</p>
            <p className="font-semibold text-soft">{krwShort(summary.totalLiability)}</p>
          </div>
          <div className="rounded-xl bg-base p-3">
            <p className="text-muted">월 수입</p>
            <p className="font-semibold text-soft">{krwShort(summary.income)}</p>
          </div>
          <div className="rounded-xl bg-base p-3">
            <p className="text-muted">월 잉여</p>
            <p
              className={`font-semibold ${
                summary.monthlyLeftover >= 0 ? 'text-asset' : 'text-red-400'
              }`}
            >
              {krwShort(summary.monthlyLeftover)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base text-muted">
            {backend === 'supabase' ? '☁️ 클라우드' : '💾 로컬'}
          </span>
          <button
            onClick={() => setOpen(true)}
            className="btn bg-asset/20 text-asset hover:bg-asset/30"
          >
            상세 · 편집
          </button>
        </div>
      </DashboardCard>

      <Modal open={open} onClose={() => setOpen(false)} title="자산 상세 · 편집">
        <AssetDetail data={data} />
      </Modal>
    </>
  )
}
