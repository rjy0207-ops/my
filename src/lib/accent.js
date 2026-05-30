/**
 * 카드 액센트별 정적 Tailwind 클래스 매핑.
 * 동적 문자열(`bg-${x}`)은 Tailwind 퍼지에 걸려 사라지므로
 * 완성된 클래스명을 명시적으로 나열한다.
 */
export const ACCENT = {
  asset: { text: 'text-asset', borderTop: 'border-t-asset', btn: 'bg-asset/20 text-asset hover:bg-asset/30' },
  agent: { text: 'text-agent', borderTop: 'border-t-agent', btn: 'bg-agent/20 text-agent hover:bg-agent/30' },
  house: { text: 'text-house', borderTop: 'border-t-house', btn: 'bg-house/20 text-house hover:bg-house/30' },
  travel: { text: 'text-travel', borderTop: 'border-t-travel', btn: 'bg-travel/20 text-travel hover:bg-travel/30' },
  future: { text: 'text-future', borderTop: 'border-t-future', btn: 'bg-future/20 text-future hover:bg-future/30' },
  car: { text: 'text-car', borderTop: 'border-t-car', btn: 'bg-car/20 text-car hover:bg-car/30' },
}
