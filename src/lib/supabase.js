import { createClient } from '@supabase/supabase-js'

// Vite 는 import.meta.env 를 주입하지만, 비-Vite 환경(테스트 등)에서는
// undefined 일 수 있어 방어적으로 처리한다.
const env = import.meta.env ?? {}
const url = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase 클라우드 DB 클라이언트 (PRD 4절).
 * .env 가 아직 비어 있어도 앱이 죽지 않도록 키가 없으면 null 을 반환하고,
 * 각 카드가 "DB 미연결" 상태를 안전하게 처리하도록 한다.
 */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseReady = Boolean(supabase)
