import { useState } from 'react'
import AuthGate from './components/AuthGate.jsx'
import Gnb from './components/Gnb.jsx'
import DashboardCard from './components/DashboardCard.jsx'
import AssetCard from './features/asset/AssetCard.jsx'
import FutureCard from './features/future/FutureCard.jsx'
import CollectionCard from './features/collection/CollectionCard.jsx'
import { isSupabaseReady } from './lib/supabase.js'

/**
 * 대시보드 본문 (PRD 5절 레이아웃).
 * PC/태블릿 가로: 2행 3열 그리드 / 모바일: 1열 탑다운.
 */
function Dashboard() {
  const [investmentOpen, setInvestmentOpen] = useState(false)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Gnb onOpenInvestment={() => setInvestmentOpen((v) => !v)} />

      {!isSupabaseReady && (
        <div className="mb-6 rounded-xl border border-house/40 bg-house/10 px-4 py-3 text-base text-house">
          ⚠️ Supabase 미연결: <code>.env</code> 에 VITE_SUPABASE_URL /
          VITE_SUPABASE_ANON_KEY 를 채우면 클라우드 DB 가 활성화됩니다. (현재는 브라우저 로컬 저장)
        </div>
      )}

      {/* GNB 투자 미니 탭: 6대 투자 관망 노트 */}
      {investmentOpen && (
        <div className="mb-6">
          <CollectionCard
            board="investment"
            accent="future"
            title="📈 투자 (Investment)"
            icon=""
            tags={['부동산', '금', '비트코인', '알트코인', '주식', '해외주식']}
            emptyHint="6대 투자 자산 관망·리서치 노트를 추가하세요."
          />
        </div>
      )}

      <main className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <AssetCard />

        <DashboardCard accent="agent" title="AI Agent 스터디" icon="🤖">
          <p className="text-muted">강의 진척도 · 프롬프트 샌드박스 (다음 단계 예정)</p>
        </DashboardCard>

        <CollectionCard
          board="housing"
          accent="house"
          title="나만의 집"
          icon="🏠"
          tags={['현재주거', '단독주택', '홈스타일링']}
          emptyHint="유보라 더 크레스트 정보 · 단독주택 스크랩 · 인테리어 위시리스트"
        />

        <CollectionCard
          board="travel"
          accent="travel"
          title="여행"
          icon="✈️"
          tags={['이달의 추천', '과거 여행']}
          emptyHint="이달의 추천 여행지 · 과거 여행 히스토리 아카이브"
        />

        <FutureCard />

        <CollectionCard
          board="car"
          accent="car"
          title="차"
          icon="🚗"
          tags={['이달의 차', '포르쉐', '현대', '기아', 'BMW', '기타']}
          emptyHint="최신 전기차(EV) 정보 · 브랜드별 보조금 큐레이션"
        />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  )
}
