import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard.jsx'
import Modal from '../../components/Modal.jsx'
import { useCollection } from '../collection/useCollection.js'
import { useAiCall } from '../ai/useAiCall.js'
import AiResult from '../ai/AiResult.jsx'

const DONE = '완료'
const TODO = '진행중'

/**
 * AI Agent 스터디 플레이그라운드 카드 (PRD F-02).
 *  1) 강의 진척도 트래커 — 챕터 체크리스트 (cards board=agent_course)
 *  2) 프롬프트 샌드박스 — Role 정의 후 Claude 로 간이 테스트
 */
export default function AgentCard() {
  const course = useCollection('agent_course')
  const [open, setOpen] = useState(false)

  const total = course.items.length
  const done = course.items.filter((i) => i.tag === DONE).length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <>
      <DashboardCard accent="agent" title="AI Agent 스터디" icon="🤖">
        <p className="text-base text-muted">패스트캠퍼스 강의 진척도</p>
        <p className="text-metric font-bold text-agent">
          {done} / {total || 0}
        </p>

        {/* 진척도 바 */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-base">
          <div className="h-full rounded-full bg-agent" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-base text-muted">{pct}% 완료</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base text-muted">프롬프트 샌드박스 포함</span>
          <button
            onClick={() => setOpen(true)}
            className="btn bg-agent/20 text-agent hover:bg-agent/30"
          >
            열기
          </button>
        </div>
      </DashboardCard>

      <Modal open={open} onClose={() => setOpen(false)} title="AI Agent 스터디" maxWidth="max-w-3xl">
        <CourseTracker course={course} done={done} total={total} pct={pct} />
        <hr className="my-6 border-slate-700" />
        <Sandbox />
      </Modal>
    </>
  )
}

function CourseTracker({ course, done, total, pct }) {
  const { items, add, update, remove } = course
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-agent">
          강의 진척도 ({done}/{total} · {pct}%)
        </h3>
        <button
          className="btn min-h-0 bg-agent/20 px-3 py-1 text-agent hover:bg-agent/30"
          onClick={() => add({ tag: TODO, title: '새 챕터' })}
        >
          + 챕터
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-base text-muted">
          "클로드 코드로 24시간 Full 가동" 강의의 챕터를 추가해 체크하세요.
        </p>
      )}

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 rounded-xl bg-base p-3">
            <input
              type="checkbox"
              checked={it.tag === DONE}
              onChange={(e) => update(it.id, { tag: e.target.checked ? DONE : TODO })}
              className="h-5 w-5 shrink-0"
            />
            <input
              value={it.title}
              onChange={(e) => update(it.id, { title: e.target.value })}
              className={`flex-1 rounded-lg bg-card px-3 py-2 text-base ${
                it.tag === DONE ? 'text-muted line-through' : 'text-soft'
              }`}
            />
            <button
              onClick={() => remove(it.id)}
              className="btn min-h-0 min-w-0 bg-transparent px-2 py-1 text-muted hover:text-red-400"
              aria-label="삭제"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Sandbox() {
  const [role, setRole] = useState('')
  const [prompt, setPrompt] = useState('')
  const ai = useAiCall()

  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-agent">프롬프트 샌드박스</h3>
      <label className="mb-1 block text-base text-muted">에이전트 Role (system) 정의</label>
      <textarea
        value={role}
        onChange={(e) => setRole(e.target.value)}
        rows={3}
        placeholder="예: 당신은 100명 규모 AI 조직의 운영 매니저입니다…"
        className="mb-3 w-full rounded-lg bg-base px-3 py-2 text-base text-soft"
      />
      <label className="mb-1 block text-base text-muted">테스트 프롬프트 (user)</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        placeholder="예: 신규 입사한 에이전트 3명에게 온보딩 지시를 내려줘."
        className="mb-3 w-full rounded-lg bg-base px-3 py-2 text-base text-soft"
      />
      <button
        onClick={() => ai.run('sandbox', { role, prompt })}
        disabled={ai.loading}
        className="btn bg-agent/20 text-agent hover:bg-agent/30 disabled:opacity-50"
      >
        {ai.loading ? '실행 중…' : 'Claude 로 실행 ▶'}
      </button>

      <div className="mt-4">
        <AiResult loading={ai.loading} error={ai.error} result={ai.result} />
      </div>
    </div>
  )
}
