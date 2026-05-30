/**
 * AI 호출 결과 표시 (로딩 / 에러 / 결과 + 호출 카운트).
 * 응답 텍스트는 마크다운 원문을 그대로 가독성 있게 노출(pre-wrap).
 */
export default function AiResult({ loading, error, result }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-base text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
        Claude 가 분석 중입니다…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-base text-red-300">
        {error}
      </div>
    )
  }

  if (!result) return null

  return (
    <div>
      <pre className="whitespace-pre-wrap break-words rounded-xl bg-base p-4 text-base leading-relaxed text-soft">
        {result.text}
      </pre>
      {result.limit != null && (
        <p className="mt-3 text-right text-base text-muted">
          오늘 호출 {result.callsToday ?? '?'} / {result.limit}회
        </p>
      )}
    </div>
  )
}
