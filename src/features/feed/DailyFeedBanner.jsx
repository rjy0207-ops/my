import { useDailyFeed } from './useDailyFeed.js'
import { ACCENT } from '../../lib/accent.js'

/**
 * 카드 상단 데일리 피드 배너 (PRD F-07).
 * n8n 이 매일 갱신하는 "오늘의 한 줄 평" 을 보여주고,
 * [📌 보관함 저장] 버튼으로 saved_items 에 누적한다.
 * n8n 미연동 환경을 위해 [🔄 샘플 갱신] 시뮬레이션도 제공.
 */
export default function DailyFeedBanner({ source, accent }) {
  const { feed, loading, savedNote, refreshSample, saveToArchive } = useDailyFeed(source)

  return (
    <div className="mb-3 rounded-xl border border-slate-700 bg-base p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className={`text-base font-medium ${ACCENT[accent].text}`}>오늘의 정보</span>
        {feed?.fetched_at && (
          <span className="text-base text-muted">
            {new Date(feed.fetched_at).toLocaleDateString('ko-KR')}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-base text-muted">…</p>
      ) : feed ? (
        <p className="text-base text-soft">{feed.summary}</p>
      ) : (
        <p className="text-base text-muted">
          아직 갱신된 정보가 없습니다. n8n 파이프라인이 매일 채워줍니다.
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={refreshSample}
          className="btn min-h-0 bg-transparent px-2 py-1 text-base text-muted hover:text-soft"
          title="n8n 없이 동작 확인용"
        >
          🔄 샘플 갱신
        </button>
        <div className="flex items-center gap-2">
          {savedNote && <span className="text-base text-asset">{savedNote}</span>}
          <button
            onClick={saveToArchive}
            disabled={!feed}
            className={`btn min-h-0 px-3 py-1 ${ACCENT[accent].btn} disabled:opacity-40`}
          >
            📌 보관함 저장
          </button>
        </div>
      </div>
    </div>
  )
}
