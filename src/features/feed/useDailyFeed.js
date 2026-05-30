import { useCallback, useEffect, useState } from 'react'
import { createRepo } from '../../lib/repo.js'

const feedRepo = createRepo('daily_feed', { orderBy: 'fetched_at' })
const savedRepo = createRepo('saved_items', { orderBy: 'saved_at' })

/** n8n 이 없을 때 로컬에서 동작을 보여주기 위한 샘플 생성기 */
const SAMPLE = {
  housing: () => ({
    summary:
      '고덕 유보라 더 크레스트 인근 전용 84㎡ 급매 1건 신규 — 직전 실거래 대비 약 3% 하향. 학군·교통 양호.',
    raw: { source: 'sample', area: '84㎡', tag: '급매' },
  }),
  car: () => ({
    summary:
      '폴스타4 국내 보조금 적용가 갱신 — 1회 충전 580km(WLTP). 동급 대비 가격경쟁력 상승.',
    raw: { source: 'sample', model: 'Polestar 4', range: '580km' },
  }),
}

/**
 * 데일리 피드 훅 (PRD F-07).
 * source(housing/car) 별 "오늘의 한 줄 평" 최신 1건을 읽고,
 * 갱신(덮어쓰기) 및 보관함 저장을 제공한다.
 */
export function useDailyFeed(source) {
  const [feed, setFeed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savedNote, setSavedNote] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    const all = await feedRepo.list() // fetched_at desc
    setFeed(all.find((r) => r.source === source) ?? null)
    setLoading(false)
  }, [source])

  useEffect(() => {
    reload()
  }, [reload])

  // 덮어쓰기 갱신: 기존 source 행 제거 후 새로 삽입 (n8n 동작 모사)
  const refresh = async ({ summary, raw }) => {
    const all = await feedRepo.list()
    for (const r of all.filter((r) => r.source === source)) {
      await feedRepo.remove(r.id)
    }
    await feedRepo.insert({
      source,
      summary,
      raw: raw ?? {},
      fetched_at: new Date().toISOString(),
    })
    await reload()
  }

  const refreshSample = () => refresh(SAMPLE[source]())

  // 📌 보관함에 누적 저장 (반영구 아카이빙)
  const saveToArchive = async () => {
    if (!feed) return
    await savedRepo.insert({
      source_table: 'daily_feed',
      snapshot: { source, summary: feed.summary, raw: feed.raw, fetched_at: feed.fetched_at },
      saved_at: new Date().toISOString(),
    })
    setSavedNote('보관함에 저장됨 📌')
    setTimeout(() => setSavedNote(''), 1500)
  }

  return { feed, loading, savedNote, refresh, refreshSample, saveToArchive, backend: feedRepo.backend }
}
