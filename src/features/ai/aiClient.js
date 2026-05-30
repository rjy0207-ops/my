/**
 * Claude 서버리스 엔드포인트(/api/claude) 호출 래퍼.
 *
 * vite dev 서버는 서버리스 함수를 실행하지 않으므로, 로컬 개발에서는
 * `vercel dev` 로 띄워야 동작한다. 일반 `npm run dev` 에서는 404 가 나며,
 * 이때 사용자에게 친절한 안내 메시지를 던진다.
 */
export async function callClaude(task, data) {
  let res
  try {
    res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, data }),
    })
  } catch {
    throw new Error('네트워크 오류: AI 엔드포인트에 연결할 수 없습니다.')
  }

  if (res.status === 404) {
    throw new Error(
      'AI 기능은 Vercel 배포(또는 `vercel dev`) 환경에서 동작합니다. ' +
        '일반 dev 서버에서는 서버리스 함수가 실행되지 않습니다.',
    )
  }

  let json
  try {
    json = await res.json()
  } catch {
    throw new Error(`서버 응답 파싱 실패 (HTTP ${res.status})`)
  }

  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
  return json // { text, usage, callsToday, limit }
}
