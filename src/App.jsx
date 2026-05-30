import { useState } from 'react'
import AuthGate from './components/AuthGate.jsx'
import Gnb from './components/Gnb.jsx'
import DashboardCard from './components/DashboardCard.jsx'
import AssetCard from './features/asset/AssetCard.jsx'
import { isSupabaseReady } from './lib/supabase.js'

/**
 * 대시보드 본문 (PRD 5절 레이아웃).
 * PC/태블릿 가로: 2행 3열 그리드 / 모바일: 1열 탑다운.
 * 현재는 1단계 셋업 단계로, 각 카드는 자리만 잡은 플레이스홀더이며
 * 이후 단계에서 Supabase CRUD 로 채워진다.
 */
function Dashboard() {
  const [investmentOpen, setInvestmentOpen] = useState(false)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Gnb onOpenInvestment={() => setInvestmentOpen((v) => !v)} />

      {!isSupabaseReady && (
        <div className="mb-6 rounded-xl border border-house/40 bg-house/10 px-4 py-3 text-base text-house">
          ⚠️ Supabase 미연결: <code>.env</code> 에 VITE_SUPABASE_URL /
          VITE_SUPABASE_ANON_KEY 를 채우면 클라우드 DB 가 활성화됩니다.
        </div>
      )}

      {investmentOpen && (
        <DashboardCard accent="future" title="📈 투자 (Investment)" >
          <p className="text-muted">
            부동산 · 금 · 비트코인 · 알트코인 · 주식 · 해외주식 관망 노트
            (2단계 이후 구현 예정).
          </p>
        </DashboardCard>
      )}

      <main className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <AssetCard />

        <DashboardCard accent="agent" title="AI Agent 스터디" icon="🤖">
          <p className="text-muted">강의 진척도 · 프롬프트 샌드박스</p>
        </DashboardCard>

        <DashboardCard accent="house" title="나만의 집" icon="🏠">
          <p className="text-muted">유보라 더 크레스트 · 주거 분석</p>
        </DashboardCard>

        <DashboardCard accent="travel" title="여행" icon="✈️">
          <p className="text-muted">이달의 추천 · 과거 여행 히스토리</p>
        </DashboardCard>

        <DashboardCard accent="future" title="나의 미래" icon="🚀">
          <p className="text-muted">커리어 로드맵 · 디데이 카운트다운</p>
        </DashboardCard>

        <DashboardCard accent="car" title="차" icon="🚗">
          <p className="text-muted">이달의 핫한 EV · 브랜드별 피드</p>
        </DashboardCard>
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
