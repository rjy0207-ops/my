import { createClient } from '@supabase/supabase-js'

/**
 * n8n 데일리 파이프라인 웹훅 수신 엔드포인트 (PRD F-07 · Vercel Serverless).
 *
 * n8n 이 매일 아침 크롤링 + LLM 정제 후 이 엔드포인트로 POST 하면,
 * 해당 source(housing/car)의 daily_feed 를 "덮어쓰기(갱신)" 한다.
 * 사용자가 보관함에 저장하기 전까지는 매일 최신 정보로 교체된다.
 *
 * 보안: N8N_WEBHOOK_SECRET 헤더(x-webhook-secret)로 호출자를 검증한다.
 *
 * n8n 측 HTTP Request 노드 예시:
 *   POST https://<배포도메인>/api/feed
 *   Header: x-webhook-secret: <비밀값>
 *   Body(JSON): { "source": "housing", "summary": "오늘의 한 줄 평", "raw": {...} }
 */

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null

const VALID_SOURCES = ['housing', 'car']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 만 허용됩니다.' })
  }

  const secret = process.env.N8N_WEBHOOK_SECRET
  if (secret && req.headers['x-webhook-secret'] !== secret) {
    return res.status(401).json({ error: '인증 실패: webhook secret 불일치.' })
  }

  if (!admin) {
    return res.status(503).json({
      error: 'Supabase service role 미설정. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 를 확인하세요.',
    })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const { source, summary, raw } = body

  if (!VALID_SOURCES.includes(source)) {
    return res.status(400).json({ error: `source 는 ${VALID_SOURCES.join(' / ')} 중 하나여야 합니다.` })
  }
  if (!summary || typeof summary !== 'string') {
    return res.status(400).json({ error: 'summary(문자열)가 필요합니다.' })
  }

  try {
    // 덮어쓰기: 기존 source 행 제거 후 최신 1건 삽입
    await admin.from('daily_feed').delete().eq('source', source)
    const { data, error } = await admin
      .from('daily_feed')
      .insert({ source, summary, raw: raw ?? {}, fetched_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error

    return res.status(200).json({ ok: true, feed: data })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
