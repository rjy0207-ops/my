import { useAuth } from '../context/AuthContext.jsx'

/**
 * 최상단 네비게이션 바 (PRD 5절).
 * [타이틀] ----------- [📈 투자 정보 보기] 미니 탭 + 로그아웃.
 */
export default function Gnb({ onOpenInvestment, onOpenArchive }) {
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 mb-6 flex items-center justify-between
      rounded-2xl bg-card/80 px-5 py-3 backdrop-blur">
      <h1 className="text-sub font-bold text-soft">나만의 대시보드</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenArchive}
          className="btn bg-base text-base text-soft hover:bg-slate-700"
        >
          📌 보관함
        </button>
        <button
          onClick={onOpenInvestment}
          className="btn bg-base text-base text-soft hover:bg-slate-700"
        >
          📈 투자 정보 보기
        </button>
        <button
          onClick={logout}
          className="btn bg-base px-3 text-base text-muted hover:bg-slate-700"
          aria-label="로그아웃"
          title="로그아웃"
        >
          ⏏
        </button>
      </div>
    </header>
  )
}
