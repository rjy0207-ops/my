/** 원화 포맷 (예: 1234000 → "₩1,234,000") */
export function krw(value) {
  const n = Number(value) || 0
  return '₩' + n.toLocaleString('ko-KR')
}

/** 억/만 단위 축약 (예: 123450000 → "1억 2,345만") */
export function krwShort(value) {
  const n = Math.round(Number(value) || 0)
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  const eok = Math.floor(abs / 100000000)
  const man = Math.floor((abs % 100000000) / 10000)
  if (eok > 0) return `${sign}${eok}억${man > 0 ? ` ${man.toLocaleString('ko-KR')}만` : ''}`
  if (man > 0) return `${sign}${man.toLocaleString('ko-KR')}만`
  return krw(n)
}
