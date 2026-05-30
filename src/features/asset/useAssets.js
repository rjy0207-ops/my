import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRepo } from '../../lib/repo.js'

const assetRepo = createRepo('assets', { orderBy: 'updated_at' })
const cashflowRepo = createRepo('cashflow', { orderBy: 'updated_at' })

export const ASSET_TYPES = ['집', '차', '코인', '주식', '현금', '기타']
export const CASHFLOW_CATEGORIES = ['수입', '고정비', '보너스활용']

/**
 * 자산 모듈 데이터 훅 (PRD F-01).
 * assets / cashflow 를 로드하고 CRUD 를 노출하며,
 * 총자산·총부채·순자산을 자동 계산한다.
 */
export function useAssets() {
  const [assets, setAssets] = useState([])
  const [cashflow, setCashflow] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [a, c] = await Promise.all([assetRepo.list(), cashflowRepo.list()])
      setAssets(a)
      setCashflow(c)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // ── 자산 CRUD ──
  const addAsset = async (row) => {
    await assetRepo.insert({ is_liability: false, value: 0, ...row })
    await reload()
  }
  const updateAsset = async (id, patch) => {
    await assetRepo.update(id, patch)
    await reload()
  }
  const removeAsset = async (id) => {
    await assetRepo.remove(id)
    await reload()
  }

  // ── 자금 흐름 CRUD ──
  const addCashflow = async (row) => {
    await cashflowRepo.insert({ amount: 0, ...row })
    await reload()
  }
  const updateCashflow = async (id, patch) => {
    await cashflowRepo.update(id, patch)
    await reload()
  }
  const removeCashflow = async (id) => {
    await cashflowRepo.remove(id)
    await reload()
  }

  // ── 요약 지표 자동 계산 ──
  const summary = useMemo(() => {
    const totalAsset = assets
      .filter((a) => !a.is_liability)
      .reduce((s, a) => s + (Number(a.value) || 0), 0)
    const totalLiability = assets
      .filter((a) => a.is_liability)
      .reduce((s, a) => s + (Number(a.value) || 0), 0)
    const income = cashflow
      .filter((c) => c.category === '수입')
      .reduce((s, c) => s + (Number(c.amount) || 0), 0)
    const fixedCost = cashflow
      .filter((c) => c.category === '고정비')
      .reduce((s, c) => s + (Number(c.amount) || 0), 0)
    return {
      totalAsset,
      totalLiability,
      netWorth: totalAsset - totalLiability,
      income,
      fixedCost,
      monthlyLeftover: income - fixedCost,
    }
  }, [assets, cashflow])

  return {
    assets,
    cashflow,
    summary,
    loading,
    error,
    backend: assetRepo.backend,
    addAsset,
    updateAsset,
    removeAsset,
    addCashflow,
    updateCashflow,
    removeCashflow,
  }
}
