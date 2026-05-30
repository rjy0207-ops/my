import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard.jsx'
import Modal from '../../components/Modal.jsx'
import RingProgress from '../../components/RingProgress.jsx'
import { useCollection } from '../collection/useCollection.js'
import { useAiCall } from '../ai/useAiCall.js'
import AiResult from '../ai/AiResult.jsx'

const STUDY_IMAGE =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80'

const ROADMAP = [
  'Agent 기본 구조와 도구 호출',
  '메모리와 RAG 연결',
  '멀티 에이전트 역할 분담',
  '평가와 로그 관측',
  '개인 자동화 배포',
]

export default function AgentCard() {
  const course = useCollection('agent_course')
  const [open, setOpen] = useState(false)

  const total = 5
  const done = 1

  return (
    <>
      <DashboardCard accent="agent" title="AI Agent 스터디" icon="🤖">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '/agent'
          }}
          className="grid w-full items-center gap-4 text-left xl:grid-cols-[112px_1fr]"
          aria-label="AI Agent 커리큘럼 열기"
        >
          <div className="flex justify-center">
            <RingProgress value={done} total={total} size={112} stroke={11} label="1/5" />
          </div>
          <div>
            <img
              src={STUDY_IMAGE}
              alt="학습 중인 모니터와 코드 개발 환경"
              className="h-36 w-full rounded-xl object-cover"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-agent/20 px-3 py-1 text-sm font-bold text-agent">
                레벨 1 진행 중
              </span>
              <span className="text-sm font-semibold text-muted">Agent 기초 설계</span>
            </div>
          </div>
        </button>
      </DashboardCard>

      <Modal open={false} onClose={() => {}} title="AI Agent 상세 커리큘럼" maxWidth="max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <CourseRoadmap course={course} />
          <PromptSandbox />
        </div>
      </Modal>
    </>
  )
}

function CourseRoadmap({ course }) {
  const { items, add, update, remove } = course

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sub font-semibold text-agent">로드맵</h3>
        <button
          className="btn min-h-0 bg-agent/20 px-3 py-1 text-agent hover:bg-agent/30"
          onClick={() => add({ tag: '진행중', title: '새 실습 단계' })}
        >
          단계 추가
        </button>
      </div>
      <ol className="space-y-3">
        {(items.length ? items : ROADMAP.map((title, index) => ({ id: `seed-${index}`, title }))).map(
          (item, index) => (
            <li key={item.id} className="flex gap-3 rounded-xl bg-base p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-agent font-bold text-white">
                {index + 1}
              </span>
              {String(item.id).startsWith('seed-') ? (
                <div>
                  <p className="font-semibold text-soft">{item.title}</p>
                  <p className="text-sm text-muted">실습 과제와 체크포인트를 정리합니다.</p>
                </div>
              ) : (
                <>
                  <input
                    value={item.title}
                    onChange={(e) => update(item.id, { title: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg bg-card px-3 py-2 text-base text-soft"
                  />
                  <button
                    onClick={() => remove(item.id)}
                    className="btn min-h-0 min-w-0 bg-transparent px-2 py-1 text-muted hover:text-red-400"
                  >
                    삭제
                  </button>
                </>
              )}
            </li>
          ),
        )}
      </ol>
    </section>
  )
}

function PromptSandbox() {
  const [role, setRole] = useState('당신은 AI Agent 학습 코치입니다.')
  const [prompt, setPrompt] = useState('오늘 배운 내용을 실무 프로젝트로 연결하는 실습 과제를 제안해줘.')
  const ai = useAiCall()

  return (
    <section className="rounded-xl bg-base p-4">
      <h3 className="mb-3 text-sub font-semibold text-agent">프롬프트 실습 에디터</h3>
      <label className="mb-1 block text-sm font-semibold text-muted">System</label>
      <textarea
        value={role}
        onChange={(e) => setRole(e.target.value)}
        rows={3}
        className="mb-3 w-full rounded-lg bg-card px-3 py-2 text-base text-soft"
      />
      <label className="mb-1 block text-sm font-semibold text-muted">User Prompt</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        className="mb-3 w-full rounded-lg bg-card px-3 py-2 text-base text-soft"
      />
      <button
        onClick={() => ai.run('sandbox', { role, prompt })}
        disabled={ai.loading}
        className="btn bg-agent/20 text-agent hover:bg-agent/30 disabled:opacity-50"
      >
        실습 실행
      </button>
      <div className="mt-4">
        <AiResult loading={ai.loading} error={ai.error} result={ai.result} />
      </div>
    </section>
  )
}
