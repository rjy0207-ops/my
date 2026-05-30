const PHOTOS = {
  house:
    'https://images.pexels.com/photos/7722158/pexels-photo-7722158.jpeg?auto=compress&cs=tinysrgb&w=1400',
  jeju:
    'https://commons.wikimedia.org/wiki/Special:FilePath/%EC%A0%9C%EC%A3%BC%20%EC%9A%A9%EB%A8%B8%EB%A6%AC%ED%95%B4%EC%95%88%20%28Jeju%20Yongmeori%20Coast%29.jpg',
  paris:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Tour%20Eiffel%20Wikimedia%20Commons.jpg',
  car:
    'https://commons.wikimedia.org/wiki/Special:FilePath/2020%20Tesla%20Model%20Y%2C%20front%208.1.20.jpg',
}

export default function DetailPage({ page, onBack }) {
  const detail = {
    finance: <FinanceDetail />,
    agent: <AgentDetail />,
    house: <HouseDetail />,
    travel: <TravelDetail />,
    future: <FutureDetail />,
    car: <CarDetail />,
  }[page]

  return (
    <main className="min-h-screen bg-base px-5 py-6 text-soft">
      <div className="mx-auto max-w-[1500px]">
        <button onClick={onBack} className="btn mb-5 bg-card text-soft hover:bg-slate-700">
          ← 대시보드로
        </button>
        {detail ?? <HouseDetail />}
      </div>
    </main>
  )
}

function PageShell({ title, subtitle, children }) {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-[34px] font-black leading-tight">{title}</h1>
        <p className="mt-2 text-base font-semibold text-muted">{subtitle}</p>
      </header>
      {children}
    </section>
  )
}

function FinanceDetail() {
  return (
    <PageShell title="나의 자산 상세" subtitle="자산 구성, 부채 비율, 거래 내역을 한 페이지에서 관리합니다.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="자산 건강판">
          {[
            ['주거/부동산', 58, 'bg-emerald-400'],
            ['주식/ETF', 24, 'bg-sky-400'],
            ['현금성', 12, 'bg-amber-300'],
            ['기타', 6, 'bg-violet-400'],
          ].map(([label, value, color]) => (
            <Bar key={label} label={label} value={value} color={color} />
          ))}
        </Panel>
        <Panel title="거래 내역 추가">
          <div className="grid gap-3">
            <input className="rounded-xl bg-base px-4 py-3" placeholder="거래 메모" />
            <input className="rounded-xl bg-base px-4 py-3" placeholder="금액" type="number" />
            <button className="btn bg-asset/20 text-asset hover:bg-asset/30">추가</button>
          </div>
        </Panel>
      </div>
    </PageShell>
  )
}

function AgentDetail() {
  return (
    <PageShell title="AI Agent 스터디 상세" subtitle="5단계 로드맵과 프롬프트 실습 에디터입니다.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="커리큘럼 로드맵">
          {['도구 호출', 'RAG 메모리', '멀티 에이전트', '평가와 로그', '배포 자동화'].map((item, index) => (
            <div key={item} className="mb-3 rounded-xl bg-base p-4 font-bold">
              {index + 1}. {item}
            </div>
          ))}
        </Panel>
        <Panel title="프롬프트 실습">
          <textarea className="h-72 w-full rounded-xl bg-base p-4" defaultValue="오늘 배운 내용을 실무 프로젝트로 연결하는 실습 과제를 제안해줘." />
        </Panel>
      </div>
    </PageShell>
  )
}

function HouseDetail() {
  return (
    <PageShell title="나만의 집 / 오늘의 집 상세" subtitle="실제 주거 사진을 기준으로 구조와 설계 방향을 기록합니다.">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <img src={PHOTOS.house} alt="실제 현대 주거 인테리어 사진" className="h-[560px] w-full rounded-2xl object-cover" />
        <Panel title="어떤 집인가">
          <p className="text-base leading-relaxed text-soft">
            큰 창과 높은 천장, 오픈형 거실/주방을 중심으로 한 현대 주거 공간입니다. 1층은 거실,
            주방, 다이닝, 테라스가 이어지는 공용 공간으로 두고, 2층은 침실과 작업실을 분리하는
            구성이 잘 어울립니다.
          </p>
          <Info label="구조" value="오픈 플랜 거실 + 주방 + 독립 홈오피스" />
          <Info label="설계 핵심" value="자연광, 수납 동선, 목재 마감, 실내외 연결감" />
          <Info label="기록 필드" value="관심 지역 평단가, 매물 링크, 가구 위시리스트" />
        </Panel>
      </div>
    </PageShell>
  )
}

function TravelDetail() {
  return (
    <PageShell title="5월 추천 여행지 상세" subtitle="실제 장소 사진과 추천 이유, 날씨, 혼잡도를 함께 봅니다.">
      <div className="grid gap-6 lg:grid-cols-2">
        <TravelPlace
          title="제주 용머리해안"
          image={PHOTOS.jeju}
          weather="5월은 바람이 선선하고 해안 산책, 드라이브, 카페 투어가 편합니다."
          crowd="연휴와 주말은 붐비지만 평일 오전은 비교적 여유롭습니다."
          reason="짧은 일정에서도 바다, 절벽 지형, 로컬 맛집을 함께 넣기 좋습니다."
        />
        <TravelPlace
          title="파리 에펠탑"
          image={PHOTOS.paris}
          weather="5월 파리는 봄에서 초여름으로 넘어가는 시기라 야외 산책과 테라스가 좋습니다."
          crowd="대표 명소는 사람이 많아 이른 아침과 해질녘 방문이 좋습니다."
          reason="도시 산책, 미술관, 카페, 야경을 한 일정에 묶기 좋습니다."
        />
      </div>
    </PageShell>
  )
}

function FutureDetail() {
  return (
    <PageShell title="나의 미래 로드맵" subtitle="3년, 5년, 10년 후 마일스톤을 작성합니다.">
      <div className="grid gap-5 md:grid-cols-3">
        {['3년 후', '5년 후', '10년 후'].map((label) => (
          <Panel key={label} title={label}>
            <textarea className="h-56 w-full rounded-xl bg-base p-4" placeholder={`${label} 목표를 입력하세요.`} />
          </Panel>
        ))}
      </div>
    </PageShell>
  )
}

function CarDetail() {
  return (
    <PageShell title="나의 드림카 상세" subtitle="실제 차량 사진과 모델명, 금액, 옵션을 정리합니다.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <img src={PHOTOS.car} alt="Tesla Model Y 실제 사진" className="h-[520px] w-full rounded-2xl object-cover" />
        <Panel title="Tesla Model Y Long Range">
          <Info label="모델명" value="Tesla Model Y Long Range" />
          <Info label="예상 금액" value="약 7,290만원부터, 옵션/보조금에 따라 변동" />
          <Info label="상세 내용" value="전기 SUV, 넓은 적재 공간, 긴 주행거리, 낮은 유지비가 장점인 현실적인 드림카 후보입니다." />
          <Info label="확인할 것" value="지역별 전기차 보조금, 보험료, 충전 환경, 옵션 구성" />
        </Panel>
      </div>
    </PageShell>
  )
}

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-lg">
      <h2 className="mb-4 text-sub font-bold">{title}</h2>
      {children}
    </section>
  )
}

function Info({ label, value }) {
  return (
    <div className="mt-4 rounded-xl bg-base p-4">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold leading-relaxed text-soft">{value}</p>
    </div>
  )
}

function Bar({ label, value, color }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm font-bold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-base">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function TravelPlace({ title, image, reason, weather, crowd }) {
  return (
    <Panel title={title}>
      <img src={image} alt={title} className="mb-4 h-80 w-full rounded-xl object-cover" />
      <Info label="왜 추천?" value={reason} />
      <Info label="날씨" value={weather} />
      <Info label="사람들" value={crowd} />
    </Panel>
  )
}
