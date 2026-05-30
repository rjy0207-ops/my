/**
 * SVG 원형 진행률 바 (PRD F-02 AI Agent 스터디 1/5 단계 표시).
 *
 * props
 *  - value   : 완료 수 (예: 1)
 *  - total   : 전체 수 (예: 5)
 *  - color   : 진행 색 (기본 agent 인디고)
 *  - size    : px (기본 84)
 *  - label   : 중앙 텍스트 오버라이드 (기본 "value/total")
 */
export default function RingProgress({
  value = 0,
  total = 0,
  color = '#6366F1',
  size = 84,
  stroke = 9,
  label,
}) {
  const pct = total > 0 ? Math.min(1, value / total) : 0
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#334155" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sub font-bold text-soft">{label ?? `${value}/${total}`}</span>
      </div>
    </div>
  )
}
