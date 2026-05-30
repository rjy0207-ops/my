import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'dashboard_auth'

/**
 * 간이 단일 비밀번호 인증 (PRD F-00).
 * 1인 전용 시스템이므로 VITE_DASHBOARD_PASSWORD 환경변수와 비교하는
 * 가벼운 게이트. 통과 시 sessionStorage 에 플래그를 저장해
 * 새로고침해도 세션이 유지된다.
 *
 * 주의: 클라이언트 사이드 비교이므로 "민감 데이터 보호"용 1차 차단막일 뿐,
 * 실제 데이터 접근 제어는 Supabase RLS 로 별도 보강할 것.
 */
export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'ok') {
      setIsAuthed(true)
    }
  }, [])

  function login(password) {
    const expected = import.meta.env.VITE_DASHBOARD_PASSWORD
    if (expected && password === expected) {
      sessionStorage.setItem(STORAGE_KEY, 'ok')
      setIsAuthed(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setIsAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
