import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard.jsx'
import Modal from '../../components/Modal.jsx'

const FUTURE_IMAGES = {
  home:
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
  career:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
}

export default function FutureCard() {
  const [open, setOpen] = useState(false)
  const [milestones, setMilestones] = useState({
    y3: 'AI Agent 실무 포트폴리오 완성, 현금흐름 안정화',
    y5: '자가 주택 기반 마련, 리드급 커리어 포지션 달성',
    y10: '이상적인 주거와 커리어를 결합한 독립적 라이프스타일',
  })

  return (
    <>
      <DashboardCard accent="future" title="나의 미래 (비전)" icon="🌠">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '/future'
          }}
          className="grid w-full gap-3 text-left"
          aria-label="비전 로드맵 열기"
        >
          <div className="grid grid-cols-2 gap-3">
            <VisionPane image={FUTURE_IMAGES.home} text="꿈꾸는 미래의 자가 주택" />
            <VisionPane image={FUTURE_IMAGES.career} text="이상적인 커리어 환경" />
          </div>
          <p className="rounded-xl bg-base p-3 text-sm font-semibold leading-relaxed text-soft">
            3년, 5년, 10년 단위로 삶의 방향을 구체화하는 비전 로드맵입니다.
          </p>
        </button>
      </DashboardCard>

      <Modal open={false} onClose={() => {}} title="비전 로드맵 그리드" maxWidth="max-w-5xl">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['y3', '3년 후'],
            ['y5', '5년 후'],
            ['y10', '10년 후'],
          ].map(([key, label]) => (
            <label key={key} className="rounded-xl bg-base p-4">
              <span className="text-sub font-semibold text-future">{label}</span>
              <textarea
                value={milestones[key]}
                onChange={(e) => setMilestones({ ...milestones, [key]: e.target.value })}
                rows={8}
                className="mt-3 w-full rounded-lg bg-card px-3 py-2 text-base text-soft"
              />
            </label>
          ))}
        </div>
      </Modal>
    </>
  )
}

function VisionPane({ image, text }) {
  return (
    <div className="relative h-44 overflow-hidden rounded-xl">
      <img src={image} alt={text} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
      <p className="absolute bottom-3 left-3 right-3 text-base font-black leading-tight text-white">
        {text}
      </p>
    </div>
  )
}
