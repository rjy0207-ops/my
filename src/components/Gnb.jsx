import { useAuth } from '../context/AuthContext.jsx'

export default function Gnb({ onOpenInvestment, onOpenArchive, onManualSave, savedAt }) {
  const { logout } = useAuth()

  return (
    <header
      className="sticky top-0 z-10 mb-6 flex flex-wrap items-center justify-between gap-3
      rounded-2xl bg-card/85 px-5 py-3 backdrop-blur"
    >
      <div>
        <h1 className="text-sub font-bold text-soft">나만의 대시보드</h1>
        {savedAt && (
          <p className="mt-0.5 text-sm font-semibold text-muted">
            마지막 수동저장: {savedAt}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onManualSave}
          className="btn bg-asset/20 text-asset hover:bg-asset/30"
        >
          수동저장
        </button>
        <button
          onClick={onOpenArchive}
          className="btn bg-base text-base text-soft hover:bg-slate-700"
        >
          보관함
        </button>
        <button
          onClick={onOpenInvestment}
          className="btn bg-base text-base text-soft hover:bg-slate-700"
        >
          투자 정보 보기
        </button>
        <button
          onClick={logout}
          className="btn bg-base px-3 text-base text-muted hover:bg-slate-700"
          aria-label="로그아웃"
          title="로그아웃"
        >
          로그아웃
        </button>
      </div>
    </header>
  )
}
