import { supabase, isSupabaseReady } from './supabase.js'

/**
 * 테이블 단위 데이터 접근 추상화 (PRD 2단계).
 *
 * Supabase 키가 있으면 클라우드 PostgreSQL 로 읽기/쓰기,
 * 없으면 localStorage 로 폴백한다. 덕분에 .env 미설정 상태에서도
 * UI/CRUD 를 그대로 테스트할 수 있고, 키만 채우면 코드 수정 없이
 * 클라우드로 전환된다.
 *
 * 두 경로 모두 동일한 시그니처를 노출한다:
 *   list()                  → 정렬된 행 배열
 *   insert(row)             → 생성된 행
 *   update(id, patch)       → 수정된 행
 *   remove(id)              → void
 */
export function createRepo(table, { orderBy = 'updated_at', ascending = false } = {}) {
  if (isSupabaseReady) {
    return {
      backend: 'supabase',
      async list() {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order(orderBy, { ascending })
        if (error) throw error
        return data ?? []
      },
      async insert(row) {
        const { data, error } = await supabase
          .from(table)
          .insert(row)
          .select()
          .single()
        if (error) throw error
        return data
      },
      async update(id, patch) {
        const { data, error } = await supabase
          .from(table)
          .update({ ...patch, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      },
      async remove(id) {
        const { error } = await supabase.from(table).delete().eq('id', id)
        if (error) throw error
      },
    }
  }

  // ── localStorage 폴백 ──
  const key = `dashboard:${table}`
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]')
    } catch {
      return []
    }
  }
  const write = (rows) => localStorage.setItem(key, JSON.stringify(rows))
  const uid = () =>
    (crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return {
    backend: 'local',
    async list() {
      const rows = read()
      return [...rows].sort((a, b) => {
        const av = a[orderBy] ?? ''
        const bv = b[orderBy] ?? ''
        return ascending ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
      })
    },
    async insert(row) {
      const rows = read()
      const now = new Date().toISOString()
      const created = { id: uid(), updated_at: now, ...row }
      rows.push(created)
      write(rows)
      return created
    },
    async update(id, patch) {
      const rows = read()
      const idx = rows.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error(`row ${id} not found`)
      rows[idx] = { ...rows[idx], ...patch, updated_at: new Date().toISOString() }
      write(rows)
      return rows[idx]
    },
    async remove(id) {
      write(read().filter((r) => r.id !== id))
    },
  }
}
