import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase 클라우드 DB 클라이언트 (PRD 4절).
 * .env 가 아직 비어 있어도 앱이 죽지 않도록 키가 없으면 null 을 반환하고,
 * 각 카드가 "DB 미연결" 상태를 안전하게 처리하도록 한다.
 */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseReady = Boolean(supabase)
