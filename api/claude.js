import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

/**
 * Claude API 중계 서버리스 엔드포인트 (PRD 4단계 · Vercel Serverless).
 *
 * 두 가지 작업을 처리한다:
 *   - task: "finance-review"  → 자산 데이터 기반 거시 재무 리뷰 (F-01)
 *   - task: "sandbox"         → 멀티 에이전트 Role 정의 프롬프트 테스트 (F-02)
 *
 * 핵심 안전장치 (PRD 제약사항 3): 하루 최대 호출 횟수 제한.
 * Supabase ai_call_log 에 호출을 기록하고, 당일 누적이 CLAUDE_DAILY_LIMIT 을
 * 넘으면 429 로 차단해 API 비용 폭탄을 막는다.
 */

const MODEL = 'claude-opus-4-8'
const DAILY_LIMIT = Number(process.env.CLAUDE_DAILY_LIMIT ?? 20)

// 서버 전용 Supabase 클라이언트 (service role → RLS 우회, 노출 금지)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null

function startOfTodayISO() {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

/** 당일 호출 횟수 확인 — 한도 초과면 막는다. */
async function checkDailyLimit() {
  if (!admin) return { ok: true, count: null } // DB 미연결 시 계측 생략(개발용)
  const { count, error } = await admin
    .from('ai_call_log')
    .select('*', { count: 'exact', head: true })
    .gte('called_at', startOfTodayISO())
  if (error) return { ok: true, count: null } // 계측 실패가 기능을 막지 않도록
  return { ok: (count ?? 0) < DAILY_LIMIT, count: count ?? 0 }
}

async function logCall(tokens) {
  if (!admin) return
  await admin.from('ai_call_log').insert({ endpoint: 'claude', tokens })
}

/** 작업별 system/user 프롬프트 구성 */
function buildPrompt(task, data) {
  if (task === 'finance-review') {
    const system =
      '당신은 신중하고 균형 잡힌 개인 자산관리 어드바이저입니다. ' +
      '제공된 자산/부채/현금흐름 데이터를 바탕으로 거시적 자산 배분 관점의 ' +
      '리뷰를 한국어로 제공합니다. 단정적 투자 권유 대신 리스크와 대안을 ' +
      '함께 제시하고, 핵심 요약 → 강점 → 리스크 → 다음 행동 제안 순서로 ' +
      '간결하게 작성합니다. 마크다운을 사용하세요.'
    const user =
      '다음은 사용자의 현재 재무 스냅샷입니다(원화).\n\n```json\n' +
      JSON.stringify(data, null, 2) +
      '\n```\n\n위 데이터를 리뷰해 주세요.'
    return { system, user }
  }
  // sandbox: 사용자가 정의한 Role 로 프롬프트를 시험 실행
  const system =
    (data?.role?.trim() ||
      '당신은 도움이 되는 AI 에이전트입니다.') +
    '\n\n(이것은 멀티 에이전트 역할 정의 테스트 환경입니다. 한국어로 답하세요.)'
  const user = data?.prompt?.trim() || '안녕하세요, 자기소개를 해주세요.'
  return { system, user }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 만 허용됩니다.' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY 가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.',
    })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const { task = 'sandbox', data = {} } = body

  // ── 하루 호출 한도 안전장치 ──
  const limit = await checkDailyLimit()
  if (!limit.ok) {
    return res.status(429).json({
      error: `오늘의 AI 호출 한도(${DAILY_LIMIT}회)를 초과했습니다. 내일 다시 시도하세요.`,
      callsToday: limit.count,
      limit: DAILY_LIMIT,
    })
  }

  try {
    const client = new Anthropic({ apiKey })
    const { system, user } = buildPrompt(task, data)

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      // 프롬프트 캐싱: 고정된 system(어드바이저 페르소나)을 캐시,
      // 변동되는 자산 데이터는 messages 에 두어 prefix 안정성 유지
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }],
    })

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')

    const totalTokens =
      (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0)
    await logCall(totalTokens)

    return res.status(200).json({
      text,
      usage: response.usage,
      callsToday: limit.count === null ? null : limit.count + 1,
      limit: DAILY_LIMIT,
    })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Anthropic 레이트 리밋. 잠시 후 재시도하세요.' })
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({ error: 'ANTHROPIC_API_KEY 가 올바르지 않습니다.' })
    }
    const status = error instanceof Anthropic.APIError ? error.status : 500
    return res.status(status || 500).json({ error: error.message })
  }
}
