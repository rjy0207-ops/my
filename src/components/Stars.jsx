export default function Stars({ value = 0, max = 5, color = '#F59E0B', className = '' }) {
  const rating = Math.max(0, Math.min(max, Number(value) || 0))

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`별점 ${rating}/${max}`}>
      {Array.from({ length: max }).map((_, index) => (
        <span key={index} style={{ color: index < rating ? color : '#64748B' }}>
          ★
        </span>
      ))}
    </span>
  )
}
