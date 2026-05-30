import { useState } from 'react'
import { callClaude } from './aiClient.js'

/**
 * Claude 호출 상태 관리 훅 (로딩/결과/에러).
 * AI 재무 리뷰(F-01)와 프롬프트 샌드박스(F-02)에서 공용으로 사용.
 */
export function useAiCall() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { text, callsToday, limit }
  const [error, setError] = useState(null)

  async function run(task, data) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const json = await callClaude(task, data)
      setResult(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  return { loading, result, error, run, reset }
}
