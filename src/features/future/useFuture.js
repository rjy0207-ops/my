import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRepo } from '../../lib/repo.js'

const eventsRepo = createRepo('career_events', { orderBy: 'sort_order', ascending: true })
const resumeRepo = createRepo('resume', { orderBy: 'updated_at' })

export const STATUS = ['past', 'present', 'future']
export const STATUS_LABEL = { past: '과거', present: '현재', future: '미래' }

/** PRD F-05 기본 커리어 로드맵 시드 */
export const DEFAULT_ROADMAP = [
  { title: '우창코넥타 입사', event_date: '2020-08-01', status: 'past', sort_order: 1 },
  { title: '우창코넥타 퇴사', event_date: '2022-07-31', status: 'past', sort_order: 2 },
  { title: '한국알박 기술기획파트 입사', event_date: '2024-07-01', status: 'present', sort_order: 3 },
  { title: 'CL2 진급 완료', event_date: '2024-07-01', status: 'present', sort_order: 4 },
  { title: '일본 본사(치가사키) 출향', event_date: '2027-01-01', status: 'future', sort_order: 5 },
  { title: 'AI/일본어 추진부 연구소 복귀', event_date: '2028-12-31', status: 'future', sort_order: 6 },
  { title: 'CL3 진급', event_date: '2029-07-01', status: 'future', sort_order: 7 },
]

/** D-day 계산: 오늘 자정 기준 남은(또는 지난) 일수 */
export function dday(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / 86400000)
  return diff // 양수=남음, 음수=지남, 0=오늘
}

export function ddayLabel(diff) {
  if (diff === null) return ''
  if (diff === 0) return 'D-DAY'
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
}

/** 나의 미래 데이터 훅 (커리어 이벤트 + 이력서) */
export function useFuture() {
  const [events, setEvents] = useState([])
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const [ev, rs] = await Promise.all([eventsRepo.list(), resumeRepo.list()])
    setEvents(ev)
    setResume(rs[0] ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const addEvent = async (row) => {
    const sort_order = (events.at(-1)?.sort_order ?? 0) + 1
    await eventsRepo.insert({ title: '새 일정', status: 'future', sort_order, ...row })
    await reload()
  }
  const updateEvent = async (id, patch) => {
    await eventsRepo.update(id, patch)
    await reload()
  }
  const removeEvent = async (id) => {
    await eventsRepo.remove(id)
    await reload()
  }
  const seedRoadmap = async () => {
    for (const e of DEFAULT_ROADMAP) await eventsRepo.insert(e)
    await reload()
  }

  const saveResume = async (text) => {
    if (resume) await resumeRepo.update(resume.id, { content: { text } })
    else await resumeRepo.insert({ content: { text } })
    await reload()
  }

  // 가장 가까운 미래 이벤트 (메인 카운트다운용)
  const nextEvent = useMemo(() => {
    const upcoming = events
      .map((e) => ({ ...e, diff: dday(e.event_date) }))
      .filter((e) => e.diff !== null && e.diff >= 0)
      .sort((a, b) => a.diff - b.diff)
    return upcoming[0] ?? null
  }, [events])

  return {
    events,
    resume,
    nextEvent,
    loading,
    backend: eventsRepo.backend,
    addEvent,
    updateEvent,
    removeEvent,
    seedRoadmap,
    saveResume,
  }
}
