/**
 * 재사용 대시보드 카드 (PRD 5절 그리드 / 6절 디자인 가이드).
 * accent 색상으로 카드별 정체성을 표현하고, 터치 영역과 폰트 크기를
 * 가독성 가이드에 맞춘다.
 */
export default function DashboardCard({ accent = 'asset', title, icon, children }) {
  const accentBorder = {
    asset: 'border-t-asset',
    agent: 'border-t-agent',
    house: 'border-t-house',
    travel: 'border-t-travel',
    future: 'border-t-future',
    car: 'border-t-car',
  }[accent]

  const accentText = {
    asset: 'text-asset',
    agent: 'text-agent',
    house: 'text-house',
    travel: 'text-travel',
    future: 'text-future',
    car: 'text-car',
  }[accent]

  return (
    <section
      className={`flex flex-col rounded-2xl border-t-4 ${accentBorder}
        bg-card p-6 shadow-lg`}
    >
      <header className="mb-4 flex items-center gap-2">
        {icon && <span className="text-sub">{icon}</span>}
        <h2 className={`text-sub font-semibold ${accentText}`}>{title}</h2>
      </header>
      <div className="flex-1 text-base text-soft">{children}</div>
    </section>
  )
}
