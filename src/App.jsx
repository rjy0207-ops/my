import { useEffect, useState } from 'react'
import AuthGate from './components/AuthGate.jsx'
import Gnb from './components/Gnb.jsx'
import DetailPage from './components/DetailPage.jsx'
import AssetCard from './features/asset/AssetCard.jsx'
import AgentCard from './features/agent/AgentCard.jsx'
import FutureCard from './features/future/FutureCard.jsx'
import CollectionCard from './features/collection/CollectionCard.jsx'
import ArchiveModal from './features/archive/ArchiveModal.jsx'
import { isSupabaseReady } from './lib/supabase.js'

/**
 * 대시보드 본문 (PRD 5절 레이아웃).
 * PC/태블릿 가로: 2행 3열 그리드 / 모바일: 1열 탑다운.
 */
function Dashboard() {
  const [investmentOpen, setInvestmentOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [savedAt, setSavedAt] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dashboard:manual-save') ?? '{}').savedAt ?? ''
    } catch {
      return ''
    }
  })

  function handleManualSave() {
    const nextSavedAt = new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date())

    localStorage.setItem(
      'dashboard:manual-save',
      JSON.stringify({
        savedAt: nextSavedAt,
        savedAtIso: new Date().toISOString(),
      }),
    )
    setSavedAt(nextSavedAt)
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-6">
      <Gnb
        onOpenInvestment={() => setInvestmentOpen((v) => !v)}
        onOpenArchive={() => setArchiveOpen(true)}
        onManualSave={handleManualSave}
        savedAt={savedAt}
      />
      <ArchiveModal open={archiveOpen} onClose={() => setArchiveOpen(false)} />

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

      <main className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
        <AssetCard />

        <AgentCard />

        <CollectionCard
          board="housing"
          accent="house"
          title="나만의 집"
          icon="🏠"
          tags={['현재주거', '단독주택', '홈스타일링']}
          emptyHint="유보라 더 크레스트 정보 · 단독주택 스크랩 · 인테리어 위시리스트"
          feedSource="housing"
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
          feedSource="car"
        />
      </main>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState(() => window.location.hash.replace('#/', ''))

  useEffect(() => {
    const onHashChange = () => setPage(window.location.hash.replace('#/', ''))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <AuthGate>
      {page ? (
        <DetailPage
          page={page}
          onBack={() => {
            window.location.hash = ''
            setPage('')
          }}
        />
      ) : (
        <Dashboard />
      )}
    </AuthGate>
  )
}
