import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRepo } from '../../lib/repo.js'

/**
 * 범용 카드 컬렉션 훅 (3단계: 투자·집·여행·차 공용).
 * 단일 `cards` 테이블을 board 값으로 분리해 사용한다.
 * (행 수가 적은 개인용이라 board 필터는 클라이언트에서 처리)
 */
export function useCollection(board) {
  const repo = useMemo(() => createRepo('cards', { orderBy: 'updated_at' }), [])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const all = await repo.list()
      setItems(all.filter((r) => r.board === board))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [repo, board])

  useEffect(() => {
    reload()
  }, [reload])

  const add = async (row) => {
    await repo.insert({ board, title: '새 항목', body: '', ...row })
    await reload()
  }
  const update = async (id, patch) => {
    await repo.update(id, patch)
    await reload()
  }
  const remove = async (id) => {
    await repo.remove(id)
    await reload()
  }

  return { items, loading, error, backend: repo.backend, add, update, remove }
}
