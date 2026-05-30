import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard.jsx'
import Modal from '../../components/Modal.jsx'
import Stars from '../../components/Stars.jsx'
import { ACCENT } from '../../lib/accent.js'
import { useCollection } from './useCollection.js'
import CollectionEditor from './CollectionEditor.jsx'

const IMAGES = {
  house:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=85',
  jeju:
    'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1100&q=85',
  paris:
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1100&q=85',
  car:
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1100&q=85',
}

export default function CollectionCard({ board, accent, title, icon, tags, emptyHint }) {
  const data = useCollection(board)

  if (board === 'housing') return <HousingCard data={data} />
  if (board === 'travel') return <TravelCard data={data} />
  if (board === 'car') return <CarCard data={data} />

  return (
    <GenericCollectionCard
      data={data}
      accent={accent}
      title={title}
      icon={icon}
      tags={tags}
      emptyHint={emptyHint}
    />
  )
}

function HousingCard({ data }) {
  const { items, add, update, remove } = data
  const [open, setOpen] = useState(false)

  return (
    <DashboardCard accent="house" title="나만의 집 / 오늘의 집" icon="🏠">
      <button
        type="button"
        onClick={() => {
          window.location.hash = '/house'
        }}
        className="grid w-full gap-5 text-left xl:grid-cols-[1.1fr_0.9fr]"
        aria-label="집 상세 정보 펼치기"
      >
        <img
          src={IMAGES.house}
          alt="실제 주거 인테리어 사진"
          className="h-56 w-full rounded-xl object-cover"
        />
        <div className="flex flex-col justify-center">
          <Stars value={5} className="text-2xl" />
          <p className="mt-3 text-lg font-bold text-soft">모던 우드 하우스</p>
          <p className="mt-2 text-base font-semibold leading-relaxed text-muted">
            큰 창, 목재 마감, 거실 중심 동선이 살아 있는 따뜻한 단독주택 무드.
          </p>
          <span className="mt-4 text-sm font-semibold text-house">클릭하면 설계/구성 정보가 펼쳐집니다</span>
        </div>
      </button>

      {false && (
        <div className="mt-5 grid gap-5 rounded-xl bg-base p-5 xl:grid-cols-[1fr_0.9fr]">
          <section>
            <h3 className="font-semibold text-house">어떤 집인가</h3>
            <p className="mt-2 text-base leading-relaxed text-soft">
              가족과 혼자만의 시간을 모두 고려한 2층형 주택 콘셉트입니다. 1층은 거실, 주방,
              다이닝이 이어지는 오픈 플랜으로 두고, 2층은 침실과 작업실을 분리해 조용한 생활
              구역으로 구성하는 방향이 잘 어울립니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Info label="구조" value="2층 단독주택 / 오픈 플랜" />
              <Info label="핵심 공간" value="거실, 홈오피스, 테라스" />
              <Info label="무드" value="우드, 자연광, 미니멀" />
              <Info label="추천 포인트" value="큰 창과 수납 동선" />
            </div>
          </section>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-house">위시리스트 / 평단가</h3>
              <button
                className="btn min-h-0 bg-house/20 px-3 py-1 text-house hover:bg-house/30"
                onClick={() => add({ tag: '가구', title: '월넛 식탁', body: '' })}
              >
                추가
              </button>
            </div>
            <WishList items={items} update={update} remove={remove} />
            <textarea
              rows={4}
              className="mt-3 w-full rounded-lg bg-card px-3 py-2 text-base text-soft"
              placeholder="예: 관심 지역 평단가, 단지명, 매물 메모"
            />
          </section>
        </div>
      )}
    </DashboardCard>
  )
}

function TravelCard({ data }) {
  const { items, add, update, remove } = data
  const [open, setOpen] = useState(false)

  return (
    <>
      <DashboardCard accent="travel" title="여행 / 5월 추천 여행지" icon="✈️">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '/travel'
          }}
          className="block w-full text-left"
          aria-label="여행 추천 상세 열기"
        >
          <div className="grid grid-cols-2 gap-4">
            <TravelPane image={IMAGES.jeju} label="국내: 제주 해안" />
            <TravelPane image={IMAGES.paris} label="해외: 파리 에펠탑" />
          </div>
          <p className="mt-4 rounded-xl bg-base p-3 text-base font-semibold leading-relaxed text-soft">
            5월 추천: 너무 덥지 않은 날씨, 걷기 좋은 동선, 사진으로 남기기 좋은 풍경이 핵심입니다.
          </p>
        </button>
      </DashboardCard>

      <Modal open={false} onClose={() => {}} title="5월 여행 추천 상세" maxWidth="max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <TravelDetail
            title="제주 해안"
            image={IMAGES.jeju}
            weather="5월은 바람이 선선하고 해안 산책, 드라이브, 카페 투어가 편합니다."
            crowd="연휴와 주말은 사람이 많고, 평일 오전 해안도로는 비교적 여유롭습니다."
            reason="짧은 휴식으로도 리프레시가 크고, 바다/오름/맛집을 한 일정에 넣기 좋습니다."
          />
          <TravelDetail
            title="파리 에펠탑"
            image={IMAGES.paris}
            weather="5월 파리는 봄에서 초여름으로 넘어가는 시기라 야외 산책과 테라스가 좋습니다."
            crowd="대표 관광지는 붐비지만, 이른 아침과 해질녘은 사진 찍기 좋은 시간대입니다."
            reason="도시 산책, 미술관, 야경, 카페 문화를 한 번에 경험하기 좋습니다."
          />
        </div>
        <section className="mt-6 rounded-xl bg-base p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sub font-semibold text-travel">가고 싶은 장소 버킷리스트</h3>
            <button
              className="btn min-h-0 bg-travel/20 px-3 py-1 text-travel hover:bg-travel/30"
              onClick={() => add({ tag: '버킷', title: '새 장소', body: '' })}
            >
              추가
            </button>
          </div>
          <WishList items={items} update={update} remove={remove} />
        </section>
      </Modal>
    </>
  )
}

function CarCard() {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState(72900000)
  const [option, setOption] = useState(4800000)
  const [subsidy, setSubsidy] = useState(5500000)
  const finalPrice = price + option - subsidy

  return (
    <>
      <DashboardCard accent="car" title="차 / 나의 드림카" icon="🚗">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '/car'
          }}
          className="block w-full text-left"
          aria-label="드림카 상세 열기"
        >
          <img src={IMAGES.car} alt="드림카 실제 주행 사진" className="h-56 w-full rounded-xl object-cover" />
          <div className="mt-4 rounded-xl bg-base p-4">
            <p className="text-sm font-semibold text-car">Dream Model</p>
            <h3 className="mt-1 text-xl font-black text-soft">Tesla Model Y Long Range</h3>
            <p className="mt-2 text-base font-semibold text-muted">예상 금액: 7,290만원부터</p>
            <p className="mt-2 text-base leading-relaxed text-soft">
              전기 SUV, 긴 주행거리, 넓은 실내 공간, 유지비 절감이 장점인 현실적인 드림카 후보입니다.
            </p>
          </div>
        </button>
      </DashboardCard>

      <Modal open={false} onClose={() => {}} title="드림카 상세 정보 / 계산기" maxWidth="max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-xl bg-base p-4">
            <img src={IMAGES.car} alt="드림카 주행 사진" className="mb-4 h-64 w-full rounded-xl object-cover" />
            <h3 className="text-sub font-semibold text-car">Tesla Model Y Long Range</h3>
            <p className="mt-3 text-base leading-relaxed text-soft">
              모델 Y 롱레인지는 패밀리카와 데일리카 사이의 균형이 좋고, 넓은 트렁크와 전기차 특유의
              정숙성이 장점입니다. 옵션은 오토파일럿, 실내 색상, 휠 사이즈를 중심으로 비교하면 좋습니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Info label="차종" value="전기 SUV" />
              <Info label="예상 가격" value="7,290만원부터" />
              <Info label="관심 옵션" value="오토파일럿, 20인치 휠" />
              <Info label="보조금" value="지역별 확인 필요" />
            </div>
          </section>
          <section className="rounded-xl bg-base p-4">
            <h3 className="mb-3 text-sub font-semibold text-car">옵션 커스텀 계산기</h3>
            <NumberField label="차량가" value={price} onChange={setPrice} />
            <NumberField label="옵션 합계" value={option} onChange={setOption} />
            <NumberField label="전기차 보조금" value={subsidy} onChange={setSubsidy} />
            <p className="mt-4 rounded-xl bg-card p-4 text-xl font-bold text-soft">
              예상 실구매가 {finalPrice.toLocaleString('ko-KR')}원
            </p>
          </section>
        </div>
      </Modal>
    </>
  )
}

function GenericCollectionCard({ data, accent, title, icon, tags, emptyHint }) {
  const { items, loading, error, backend } = data
  const [open, setOpen] = useState(false)
  const preview = items.slice(0, 3)

  return (
    <>
      <DashboardCard accent={accent} title={title} icon={icon}>
        {error && <p className="text-base text-red-400">오류: {error}</p>}

        {loading ? (
          <p className="text-base text-muted">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="text-base text-muted">{emptyHint}</p>
        ) : (
          <ul className="space-y-2">
            {preview.map((it) => (
              <li key={it.id} className="rounded-xl bg-base p-3">
                <div className="flex items-center gap-2">
                  {it.tag && (
                    <span className={`shrink-0 text-base ${ACCENT[accent].text}`}>#{it.tag}</span>
                  )}
                  <span className="truncate font-medium text-soft">{it.title}</span>
                </div>
                {it.body && <p className="mt-1 line-clamp-2 text-base text-muted">{it.body}</p>}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base text-muted">
            {backend === 'supabase' ? '클라우드' : '로컬'} · {items.length}개
          </span>
          <button onClick={() => setOpen(true)} className={`btn ${ACCENT[accent].btn}`}>
            추가 · 편집
          </button>
        </div>
      </DashboardCard>

      <Modal open={open} onClose={() => setOpen(false)} title={`${title} · 편집`}>
        <CollectionEditor data={data} tags={tags} accent={accent} />
      </Modal>
    </>
  )
}

function WishList({ items, update, remove }) {
  if (items.length === 0) {
    return <p className="rounded-xl bg-card p-3 text-muted">아직 기록이 없습니다. 추가 버튼으로 시작하세요.</p>
  }

  return (
    <ul className="space-y-2">
      {items.slice(0, 5).map((item) => (
        <li key={item.id} className="flex gap-2 rounded-xl bg-card p-2">
          <input
            value={item.title}
            onChange={(e) => update(item.id, { title: e.target.value })}
            className="min-w-0 flex-1 rounded-lg bg-base px-3 py-2 text-base text-soft"
          />
          <button
            onClick={() => remove(item.id)}
            className="btn min-h-0 min-w-0 bg-transparent px-2 py-1 text-muted hover:text-red-400"
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  )
}

function TravelPane({ image, label }) {
  return (
    <figure className="overflow-hidden rounded-xl bg-base">
      <img src={image} alt={label} className="h-44 w-full object-cover" />
      <figcaption className="px-3 py-2 text-sm font-bold text-soft">{label}</figcaption>
    </figure>
  )
}

function TravelDetail({ title, image, weather, crowd, reason }) {
  return (
    <section className="rounded-xl bg-base p-4">
      <img src={image} alt={title} className="mb-4 h-48 w-full rounded-xl object-cover" />
      <h3 className="text-sub font-semibold text-travel">{title}</h3>
      <Info label="왜 추천?" value={reason} />
      <Info label="날씨" value={weather} />
      <Info label="사람들" value={crowd} />
    </section>
  )
}

function Info({ label, value }) {
  return (
    <div className="mt-3 rounded-xl bg-card p-3">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold leading-relaxed text-soft">{value}</p>
    </div>
  )
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg bg-card px-3 py-2 text-base text-soft"
      />
    </label>
  )
}
