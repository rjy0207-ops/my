import { useCallback, useEffect, useState } from 'react'
import { createRepo } from '../../lib/repo.js'

const savedRepo = createRepo('saved_items', { orderBy: 'saved_at' })

/** 스크랩 보관함 훅 (PRD F-07) — saved_items 누적 조회/삭제 */
export function useArchive(enabled = true) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setItems(await savedRepo.list())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) reload()
  }, [enabled, reload])

  const remove = async (id) => {
    await savedRepo.remove(id)
    await reload()
  }

  return { items, loading, reload, remove }
}
