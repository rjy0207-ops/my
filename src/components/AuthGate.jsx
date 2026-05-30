import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * 대시보드 첫 진입 시 비밀번호 입력창 (PRD F-00 / 5절).
 * 통과 시에만 children(대시보드 본문)을 렌더한다.
 */
export default function AuthGate({ children }) {
  const { isAuthed, login } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthed) return children

  function handleSubmit(e) {
    e.preventDefault()
    const ok = login(password)
    if (!ok) {
      setError('비밀번호가 올바르지 않습니다.')
      setPassword('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl"
      >
        <h1 className="mb-2 text-metric font-bold text-soft">
          나만의 대시보드
        </h1>
        <p className="mb-6 text-base text-muted">
          접속하려면 비밀번호를 입력하세요.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          placeholder="비밀번호"
          autoFocus
          className="mb-3 w-full rounded-xl border border-slate-600 bg-base
            px-4 py-3 text-base text-soft outline-none
            placeholder:text-muted focus:border-future"
        />

        {error && (
          <p className="mb-3 text-base text-red-400">{error}</p>
        )}

        <button
          type="submit"
          className="btn w-full bg-future text-white hover:bg-blue-600"
        >
          입장하기
        </button>
      </form>
    </div>
  )
}
