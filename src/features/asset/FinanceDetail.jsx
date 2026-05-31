import { useEffect, useMemo, useState } from 'react'

const fmt = new Intl.NumberFormat('ko-KR')
const won = (v) => `${fmt.format(moneyValue(v))}원`
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

const TABS = ['월간 고정비(부부)', '자산/대출 상환', '연간 보너스&경조사']
const DEFAULT_CARDS = ['농협카드', '국민카드', '네이버', '신한카드', '현대카드_지농', '현금']
const CARD_ALIASES = { 농협: '농협카드', 국민: '국민카드', 신한: '신한카드', 현대: '현대카드_지농' }
const CARD_COLORS = {
  농협카드: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200',
  국민카드: 'border-amber-400/50 bg-amber-400/10 text-amber-200',
  네이버: 'border-lime-400/50 bg-lime-400/10 text-lime-200',
  신한카드: 'border-sky-400/50 bg-sky-400/10 text-sky-200',
  현대카드_지농: 'border-violet-400/50 bg-violet-400/10 text-violet-200',
  현금: 'border-slate-300/50 bg-slate-300/10 text-slate-200',
}
const CARD_ROW_COLORS = {
  농협카드: 'border-emerald-300/80 bg-emerald-400/15 shadow-[inset_4px_0_0_rgba(52,211,153,.85)]',
  국민카드: 'border-amber-300/80 bg-amber-400/15 shadow-[inset_4px_0_0_rgba(251,191,36,.85)]',
  네이버: 'border-lime-300/80 bg-lime-400/15 shadow-[inset_4px_0_0_rgba(163,230,53,.85)]',
  신한카드: 'border-sky-300/80 bg-sky-400/15 shadow-[inset_4px_0_0_rgba(56,189,248,.85)]',
  현대카드_지농: 'border-violet-300/80 bg-violet-400/15 shadow-[inset_4px_0_0_rgba(167,139,250,.85)]',
  현금: 'border-slate-200/80 bg-slate-300/15 shadow-[inset_4px_0_0_rgba(203,213,225,.85)]',
}
const CATEGORIES = ['비용', '은행적금', '적금', '기타']

function moneyValue(value) {
  if (typeof value === 'string') {
    const text = value.trim()
    if (text.startsWith('=')) {
      const expr = text.slice(1)
      if (/^[\d\s+\-*/().,]+$/.test(expr)) {
        try {
          const result = Function(`"use strict"; return (${expr.replace(/,/g, '')})`)()
          return Number.isFinite(Number(result)) ? Number(result) : 0
        } catch {
          return 0
        }
      }
      return 0
    }
  }
  return Number(value) || 0
}

function amountFormulaPart(value) {
  if (typeof value === 'string' && value.trim().startsWith('=')) {
    return `(${value.trim().slice(1)})`
  }
  return String(moneyValue(value))
}

function normalizeCard(card) {
  const clean = String(card || '').trim()
  return CARD_ALIASES[clean] || clean
}

function inferCategory(item) {
  const current = String(item?.category || '').trim()
  if (current) return current
  const name = String(item?.name || '')
  if (name.includes('엄마') || name.includes('은행')) return '은행적금'
  if (name.includes('적금')) return '은행적금'
  return '비용'
}

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw)
    return v ?? fallback
  } catch {
    return fallback
  }
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return []
  return items.map((i) => ({
    id: i?.id || uid(),
    name: String(i?.name ?? ''),
    amount: typeof i?.amount === 'string' && i.amount.trim().startsWith('=') ? i.amount : Number(i?.amount) || 0,
    category: inferCategory(i),
    card: normalizeCard(i?.card),
  }))
}

function normalizePerson(v, fallbackIncome = 0) {
  return {
    income: moneyValue(v?.income) || fallbackIncome,
    items: normalizeItems(v?.items),
  }
}

function isLeftoverItem(item) {
  return String(item?.name || '').replace(/\s/g, '').includes('남은금액')
}

function monthKey(offset = 0) {
  const date = new Date()
  date.setMonth(date.getMonth() + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(value, fallback = '') {
  const raw = value || fallback
  const match = String(raw || '').match(/^(\d{4})-(\d{2})/)
  if (!match) return raw || ''
  return `${match[1].slice(2)}년 ${Number(match[2])}월`
}

function normalizeEvents(v) {
  if (!Array.isArray(v)) return []
  return v.map((e) => ({
    id: e?.id || uid(),
    name: String(e?.name ?? ''),
    planAmount: Number(e?.planAmount) || 0,
    actualAmount: Number(e?.actualAmount) || 0,
    memo: String(e?.memo ?? ''),
  }))
}

function useLs(key, init) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key)
    return raw == null ? (typeof init === 'function' ? init() : init) : safeParse(raw, typeof init === 'function' ? init() : init)
  })

  const save = (updater) => {
    setValue((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }

  return [value, save]
}

function MoneyInput({ value, onChange, className = '', showFormula = false }) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')
  const n = moneyValue(value)
  const commit = () => {
    const next = raw.trim()
    setFocused(false)
    if (showFormula && /[+\-*/]/.test(next)) {
      onChange(next.startsWith('=') ? next : `=${next}`)
      return
    }
    onChange(next.startsWith('=') ? next : Number(next.replace(/,/g, '')) || 0)
  }

  return (
    <input
      type="text"
      inputMode="text"
      value={focused ? raw : showFormula && typeof value === 'string' && value.trim().startsWith('=') ? value.trim().slice(1) : fmt.format(n)}
      onFocus={() => {
        setRaw(typeof value === 'string' && showFormula && value.trim().startsWith('=') ? value.trim().slice(1) : typeof value === 'string' ? value : n === 0 ? '' : String(n))
        setFocused(true)
      }}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
      }}
      className={`rounded-xl bg-base px-3 py-2 text-right text-base font-semibold text-soft focus:outline-none focus:ring-2 focus:ring-asset/40 ${className}`}
    />
  )
}
function seedJikong() {
  return {
    income: 2150000,
    items: [
      { id: uid(), name: '적금', amount: 100000, category: '은행적금', card: '' },
      { id: uid(), name: '핸드폰', amount: 30000, category: '비용', card: '' },
      { id: uid(), name: '보험', amount: 200000, category: '비용', card: '' },
    ],
  }
}

function seedJukong() {
  return {
    income: 0,
    items: [
      { id: uid(), name: '엄마', amount: 300000, category: '은행적금', card: '' },
      { id: uid(), name: '가족 여행 적금', amount: 100000, category: '비용', card: '농협카드' },
      { id: uid(), name: '오잉·아잉 적금', amount: 100000, category: '비용', card: '농협카드' },
    ],
  }
}

function seedEvents() {
  return [
    { id: uid(), name: '설날', planAmount: 1000000, actualAmount: 0, memo: '' },
    { id: uid(), name: '추석', planAmount: 1000000, actualAmount: 0, memo: '' },
    { id: uid(), name: '경조사', planAmount: 1200000, actualAmount: 0, memo: '' },
  ]
}

function seedCards(nhValue = 0) {
  return [
    { id: uid(), label: '당월', month: monthKey(0), hidden: false, 농협카드: 0, 국민카드: 0, 네이버: 0, 신한카드: 0, 현대카드_지농: 0, 현금: 0 },
    { id: uid(), label: '차월', month: monthKey(1), hidden: false, autoBudget: true, 농협카드: nhValue || 500000, 국민카드: 0, 네이버: 0, 신한카드: 0, 현대카드_지농: 0, 현금: 0 },
    { id: uid(), label: '전월', hidden: true, 농협카드: 0, 국민카드: 0, 네이버: 0, 신한카드: 0, 현대카드_지농: 0, 현금: 0 },
  ]
}

export default function FinanceDetail() {
  const [tab, setTab] = useState(0)

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-[34px] font-black leading-tight">나의 자산 관리</h1>
        <p className="mt-2 text-base font-semibold text-muted">저장된 데이터를 기준으로 월간/연간 자산 관리를 복구했습니다.</p>
      </header>

      <div className="mb-6 flex gap-1 rounded-2xl bg-card p-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold transition-all ${tab === i ? 'bg-asset text-black shadow-lg' : 'text-muted hover:text-soft'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <TabFixedCosts />}
      {tab === 1 && <TabAssetLoan />}
      {tab === 2 && <TabAnnualEvents />}
    </section>
  )
}

function TabFixedCosts() {
  const [jikong, setJikong] = useLs('finance:jikong', seedJikong)
  const [jukong, setJukong] = useLs('finance:jukong', seedJukong)
  const [showPrev, setShowPrev] = useLs('finance:cards:show-prev', false)

  const jData = normalizePerson(jikong, 2150000)
  const uData = normalizePerson(jukong, 0)

  const jFixedCost = useMemo(() => jData.items.filter((i) => !isLeftoverItem(i) && i.category === '비용').reduce((s, i) => s + moneyValue(i.amount), 0), [jData.items])
  const uFixedCost = useMemo(() => uData.items.filter((i) => !isLeftoverItem(i) && i.category === '비용').reduce((s, i) => s + moneyValue(i.amount), 0), [uData.items])
  const jSavings = useMemo(() => jData.items.filter((i) => !isLeftoverItem(i) && ['은행적금', '적금'].includes(i.category)).reduce((s, i) => s + moneyValue(i.amount), 0), [jData.items])
  const uSavings = useMemo(() => uData.items.filter((i) => !isLeftoverItem(i) && ['은행적금', '적금'].includes(i.category)).reduce((s, i) => s + moneyValue(i.amount), 0), [uData.items])
  const fixed = useMemo(() => jData.items.filter((i) => !isLeftoverItem(i)).reduce((s, i) => s + moneyValue(i.amount), 0), [jData.items])
  const transfer = Math.max(0, moneyValue(jData.income) - fixed)
  const uTotal = useMemo(() => uData.items.filter((i) => !isLeftoverItem(i)).reduce((s, i) => s + moneyValue(i.amount), 0), [uData.items])
  const living = transfer - uTotal
  const totalIncome = moneyValue(jData.income) + moneyValue(uData.income)
  const totalCost = jFixedCost + uFixedCost + Math.max(0, living)
  const totalSavings = totalIncome - totalCost
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0.0'

  const cardBudget = useMemo(() => {
    const parts = Object.fromEntries(DEFAULT_CARDS.map((card) => [card, []]))
    ;[...jData.items, ...uData.items].filter((item) => !isLeftoverItem(item)).forEach((item) => {
      const card = normalizeCard(item.card)
      if (card) {
        if (!parts[card]) parts[card] = []
        parts[card].push(amountFormulaPart(item.amount))
      }
    })
    return Object.fromEntries(
      Object.entries(parts).map(([card, values]) => [card, values.length ? `=${values.join('+')}` : 0]),
    )
  }, [jData.items, uData.items])
  const cardBudgetKey = JSON.stringify(cardBudget)
  const cardBudgetTotal = DEFAULT_CARDS.reduce((sum, card) => sum + moneyValue(cardBudget[card]), 0)
  const nhBudget = moneyValue(cardBudget.농협카드)

  const [cards, setCards] = useLs('finance:cards', seedCards(nhBudget))
  const cardRows = useMemo(() => {
    const rows = Array.isArray(cards) && cards.length ? cards : seedCards(nhBudget)
    return rows.map((row) => {
      const normalized = { ...row }
      if (normalized.label === '당월' && !normalized.month) normalized.month = monthKey(0)
      if (normalized.label === '차월' && !normalized.month) normalized.month = monthKey(1)
      Object.entries(row || {}).forEach(([key, value]) => {
        const card = normalizeCard(key)
        if (card && card !== key && !['id', 'label', 'hidden', 'month', 'autoBudget'].includes(key)) {
          normalized[card] = moneyValue(normalized[card]) + moneyValue(value)
          delete normalized[key]
        }
      })
      return normalized
    })
  }, [cards, nhBudget])
  const cardColumns = useMemo(() => {
    const fromRows = new Set()
    cardRows.forEach((row) => {
      Object.keys(row || {}).forEach((k) => {
        if (!['id', 'label', 'hidden', 'month', 'autoBudget'].includes(k)) fromRows.add(normalizeCard(k))
      })
    })
    return [...DEFAULT_CARDS, ...[...fromRows].filter((k) => !DEFAULT_CARDS.includes(k))]
  }, [cardRows])
  const itemCardOptions = useMemo(() => {
    const fromItems = new Set()
    ;[...jData.items, ...uData.items].forEach((item) => {
      if (item.card) fromItems.add(item.card)
    })
    return [...cardColumns, ...[...fromItems].filter((k) => !cardColumns.includes(k))]
  }, [cardColumns, jData.items, uData.items])
  const hiddenCardRows = cardRows.filter((row) => !['당월', '차월'].includes(row.label) || row.hidden)

  const upItem = (setter, id, patch) => setter((prev) => ({ ...normalizePerson(prev), items: normalizePerson(prev).items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }))
  const moveItem = (setter, id, direction) => setter((prev) => {
    const data = normalizePerson(prev)
    const items = [...data.items]
    const index = items.findIndex((item) => item.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= items.length || isLeftoverItem(items[index]) || isLeftoverItem(items[target])) return data
    ;[items[index], items[target]] = [items[target], items[index]]
    return { ...data, items }
  })
  const moveItemTo = (setter, draggedId, targetId) => setter((prev) => {
    const data = normalizePerson(prev)
    const items = [...data.items]
    const from = items.findIndex((item) => item.id === draggedId)
    const to = items.findIndex((item) => item.id === targetId)
    if (from < 0 || to < 0 || from === to || isLeftoverItem(items[from]) || isLeftoverItem(items[to])) return data
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    return { ...data, items }
  })
  const addItem = (setter) => setter((prev) => {
    const data = normalizePerson(prev)
    const leftoverIndex = data.items.findIndex(isLeftoverItem)
    const next = [...data.items]
    const insertAt = leftoverIndex >= 0 ? leftoverIndex : next.length
    next.splice(insertAt, 0, { id: uid(), name: '', amount: 0, category: '비용', card: '' })
    return { ...data, items: next }
  })
  const delItem = (setter, id) => setter((prev) => ({ ...normalizePerson(prev), items: normalizePerson(prev).items.filter((i) => i.id !== id) }))

  const upCard = (id, key, value) => setCards((prev) => (Array.isArray(prev) ? prev : []).map((r) => (r.id === id ? { ...r, [normalizeCard(key)]: value, autoBudget: r.label === '차월' ? false : r.autoBudget } : r)))
  const applyNextBudget = () => setCards((prev) => (Array.isArray(prev) ? prev : []).map((r) => (r.label === '차월' ? { ...r, ...cardBudget, autoBudget: true } : r)))
  const createNextMonth = () => {
    setCards((prev) => {
      const rows = Array.isArray(prev) ? prev : []
      const current = rows.find((row) => row.label === '당월') || { id: uid(), label: '당월', hidden: false }
      const next = rows.find((row) => row.label === '차월') || { id: uid(), label: '차월', hidden: false, ...cardBudget, autoBudget: true }
      const nextMonth = next.month || monthKey(1)
      const archiveLabel = monthLabel(current.month, current.label)
      const archived = { ...current, id: current.id || uid(), label: archiveLabel, hidden: true }
      return [
        archived,
        { ...next, id: next.id || uid(), label: '당월', month: nextMonth, hidden: false, autoBudget: false },
        { id: uid(), label: '차월', month: monthKey(2), hidden: false, ...cardBudget, autoBudget: true },
        ...rows.filter((row) => !['당월', '차월'].includes(row.label)).map((row) => ({ ...row, hidden: true })),
      ]
    })
  }

  useEffect(() => {
    setCards((prev) => {
      const rows = Array.isArray(prev) && prev.length ? prev : seedCards(nhBudget)
      let changed = false
      const hasCurrent = rows.some((row) => row.label === '당월')
      const hasNext = rows.some((row) => row.label === '차월')
      const prepared = [
        ...(hasCurrent ? [] : [{ id: uid(), label: '당월', month: monthKey(0), hidden: false, ...Object.fromEntries(DEFAULT_CARDS.map((card) => [card, 0])) }]),
        ...(hasNext ? [] : [{ id: uid(), label: '차월', month: monthKey(1), hidden: false, ...cardBudget, autoBudget: true }]),
        ...rows.map((row) => {
          if (['당월', '차월'].includes(row.label)) return row
          if (row.hidden !== true) changed = true
          return row.hidden === true ? row : { ...row, hidden: true }
        }),
      ]
      if (!hasCurrent || !hasNext) changed = true
      const next = prepared.map((row) => {
        if (row.label !== '차월') return row
        if (row.autoBudget === false) {
          const migrated = { ...row }
          let migratedAny = false
          DEFAULT_CARDS.forEach((card) => {
            const formula = cardBudget[card]
            if (typeof formula === 'string' && formula.startsWith('=') && moneyValue(row[card]) === moneyValue(formula)) {
              migrated[card] = formula
              migratedAny = true
            }
          })
          return migratedAny ? migrated : row
        }
        changed = true
        return { ...row, ...cardBudget, autoBudget: true }
      })
      return changed ? next : rows
    })
  }, [cardBudgetKey, nhBudget])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 rounded-2xl bg-card p-5 md:grid-cols-4">
        <Kpi label="총 수익" value={won(totalIncome)} tone="text-asset" />
        <Kpi label="비용" value={won(totalCost)} tone="text-red-300" />
        <Kpi label="적금" value={won(totalSavings)} tone="text-sky-300" />
        <Kpi label="적금율" value={`${savingsRate}%`} tone={Number(savingsRate) >= 20 ? 'text-asset' : 'text-amber-300'} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <PersonCard
          name="지콩"
          data={jData}
          onUpIncome={(v) => setJikong((p) => ({ ...normalizePerson(p), income: v }))}
          onUpItem={(id, patch) => upItem(setJikong, id, patch)}
          onMoveItemTo={(draggedId, targetId) => moveItemTo(setJikong, draggedId, targetId)}
          onAddItem={() => addItem(setJikong)}
          onDelItem={(id) => delItem(setJikong, id)}
          cardOptions={itemCardOptions}
          baseAmount={jData.income}
        />
        <PersonCard
          name="주콩"
          data={uData}
          transfer={transfer}
          onUpIncome={(v) => setJukong((p) => ({ ...normalizePerson(p), income: v }))}
          onUpItem={(id, patch) => upItem(setJukong, id, patch)}
          onMoveItemTo={(draggedId, targetId) => moveItemTo(setJukong, draggedId, targetId)}
          onAddItem={() => addItem(setJukong)}
          onDelItem={(id) => delItem(setJukong, id)}
          cardOptions={itemCardOptions}
          baseAmount={transfer}
        />
      </div>

      <div className="rounded-2xl bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-asset">월별 카드 실적</h2>
            {hiddenCardRows.length > 0 && (
              <p className="mt-1 text-sm font-semibold text-muted">숨김 기록 {hiddenCardRows.length}개</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={applyNextBudget} className="btn min-h-0 bg-asset/20 px-4 py-2 text-asset hover:bg-asset/30">차월 카드 예산 반영</button>
            <button onClick={createNextMonth} className="btn min-h-0 bg-base px-4 py-2 text-soft hover:opacity-80">차월 생성</button>
            <button onClick={() => setShowPrev((v) => !v)} className="btn min-h-0 bg-card px-4 py-2 text-soft hover:opacity-80">{showPrev ? '숨김 다시 접기' : `숨김 보기 (${hiddenCardRows.length})`}</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="border-b border-base">
                <th className="px-3 py-2 text-left text-sm font-bold text-muted">월</th>
                {cardColumns.map((col) => (
                  <th key={col} className={`px-3 py-2 text-left text-sm font-bold ${CARD_COLORS[col] || 'text-muted'}`}>{col}</th>
                ))}
                <th className="px-3 py-2 text-left text-sm font-bold text-muted">합계</th>
                <th className="px-3 py-2 text-left text-sm font-bold text-muted">사용 가능한 금액</th>
              </tr>
            </thead>
            <tbody>
              {cardRows
                .filter((r) => ['당월', '차월'].includes(r.label) || showPrev)
                .map((r) => {
                  const total = cardColumns.reduce((s, col) => s + moneyValue(r[col]), 0)
                  const available = living + (cardBudgetTotal - total)
                  return (
                    <tr key={r.id} className="border-b border-base/40 hover:bg-base/30">
                      <td className="px-3 py-3 font-semibold text-soft">
                        {['당월', '차월'].includes(r.label) ? (
                          <input
                            type="month"
                            value={r.month || monthKey(r.label === '차월' ? 1 : 0)}
                            onChange={(e) => setCards((prev) => (Array.isArray(prev) ? prev : []).map((row) => (row.id === r.id ? { ...row, month: e.target.value } : row)))}
                            className="w-32 rounded-lg bg-base px-2 py-2 text-sm font-bold text-soft"
                          />
                        ) : (
                          <span>{monthLabel(r.month, r.label)}</span>
                        )}
                        {!['당월', '차월'].includes(r.label) && <span className="ml-2 rounded-full bg-base px-2 py-0.5 text-xs text-muted">숨김</span>}
                      </td>
                      {cardColumns.map((col) => (
                        <td key={col} className="px-2 py-2"><MoneyInput value={r[col]} onChange={(v) => upCard(r.id, col, v)} showFormula className={`w-32 border ${CARD_COLORS[col] || ''}`} /></td>
                      ))}
                      <td className="px-3 py-3 font-bold text-soft">{won(total)}</td>
                      <td className={`px-3 py-3 font-black ${available >= 0 ? 'text-sky-300' : 'text-red-300'}`}>{won(available)}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PersonCard({ name, data, transfer, onUpIncome, onUpItem, onMoveItemTo, onAddItem, onDelItem, cardOptions, baseAmount }) {
  const [draggingId, setDraggingId] = useState('')
  const items = data.items.filter((item) => !isLeftoverItem(item))
  const remaining = items.reduce((sum, item) => sum - moneyValue(item.amount), moneyValue(baseAmount))

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black text-asset">{name}</h2>
      </div>
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-base p-3">
        <span className="w-20 shrink-0 text-base font-bold text-muted">월급</span>
        <MoneyInput value={data.income} onChange={onUpIncome} className="flex-1" />
      </div>
      {transfer != null && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-base p-3">
          <span className="w-20 shrink-0 text-base font-bold text-muted">전달금</span>
          <span className="flex-1 text-right text-base font-black text-sky-300">{won(transfer)}</span>
        </div>
      )}
      <div className="mb-3 flex justify-end">
        <button onClick={onAddItem} className="text-base font-bold text-asset hover:opacity-70">+ 항목 추가</button>
      </div>
      <div className="mb-1.5 grid grid-cols-[28px_1fr_130px_92px_112px_28px] gap-1 px-1">
        <span />
        <span className="text-xs font-bold text-muted">항목명</span>
        <span className="text-right text-xs font-bold text-muted">금액</span>
        <span className="text-center text-xs font-bold text-muted">분류</span>
        <span className="text-center text-xs font-bold text-muted">카드</span>
        <span />
      </div>
      <div className="space-y-1.5">
        {items.map((item) => {
          const cardTone = CARD_COLORS[normalizeCard(item.card)] || 'border-base bg-base text-soft'
          const rowTone = CARD_ROW_COLORS[normalizeCard(item.card)] || 'border-transparent'
          return (
            <div
              key={item.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggingId) onMoveItemTo(draggingId, item.id)
                setDraggingId('')
              }}
              onDragEnd={() => setDraggingId('')}
              className={`grid grid-cols-[28px_1fr_130px_92px_112px_28px] items-center gap-1 rounded-lg border p-1 ${rowTone} ${draggingId === item.id ? 'opacity-50' : ''}`}
            >
              <button
                draggable
                onDragStart={() => setDraggingId(item.id)}
                className="cursor-grab rounded bg-base px-1 py-2 text-sm font-black text-muted active:cursor-grabbing"
                title="누른 상태로 끌어서 순서를 바꿀 수 있어요"
                aria-label="순서 이동"
              >
                ↕
              </button>
              <input value={item.name} onChange={(e) => onUpItem(item.id, { name: e.target.value })} className="rounded-lg bg-base px-2 py-3 text-center text-lg font-black text-soft" placeholder="항목명" />
              <MoneyInput value={item.amount} onChange={(v) => onUpItem(item.id, { amount: v })} className="w-full" />
              <select value={item.category || '비용'} onChange={(e) => onUpItem(item.id, { category: e.target.value })} className="h-full rounded-lg bg-base px-1 py-2.5 text-sm font-semibold text-soft text-center focus:outline-none">
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
              <select value={normalizeCard(item.card)} onChange={(e) => onUpItem(item.id, { card: e.target.value })} className={`h-full rounded-lg border px-1 py-2.5 text-sm font-semibold text-center focus:outline-none ${cardTone}`}>
                <option value="">-</option>
                {(cardOptions || DEFAULT_CARDS).map((c) => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => onDelItem(item.id)} className="pl-1 text-xl text-muted hover:text-red-400" aria-label="삭제">✕</button>
            </div>
          )
        })}
        <div className="grid grid-cols-[28px_1fr_130px_92px_112px_28px] items-center gap-1 border-t border-base/60 pt-2">
          <span />
          <div className="rounded-lg bg-base px-2 py-3 text-center text-lg font-black text-soft">{name === '주콩' ? '사용 가능한 금액' : '남은 금액'}</div>
          <div className={`rounded-xl bg-base px-3 py-2 text-right text-base font-black ${remaining >= 0 ? 'text-sky-300' : 'text-red-300'}`}>{fmt.format(remaining)}</div>
          <div className="rounded-lg bg-base/40 py-2.5 text-center text-sm text-muted">-</div>
          <div className="rounded-lg bg-base/40 py-2.5 text-center text-sm text-muted">-</div>
          <span />
        </div>
      </div>
      {name === '지콩' && <QuickCalculator />}
    </div>
  )
}

function QuickCalculator() {
  const [expr, setExpr] = useState('')
  const value = moneyValue(expr.startsWith('=') ? expr : expr ? `=${expr}` : 0)

  return (
    <div className="mt-4 rounded-xl bg-base p-3">
      <p className="mb-2 text-sm font-bold text-muted">계산기</p>
      <div className="grid grid-cols-[1fr_130px] gap-2">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value.replace(/[^0-9+\-*/().,]/g, ''))}
          className="rounded-lg bg-card px-3 py-2.5 text-center text-base font-bold text-soft"
          placeholder="500000+28550"
        />
        <div className="rounded-lg bg-card px-3 py-2.5 text-right text-base font-black text-sky-300">{fmt.format(value)}</div>
      </div>
    </div>
  )
}

function SummaryRow({ label, left, right, tone = 'text-soft' }) {
  const l = moneyValue(left)
  const r = moneyValue(right)
  return (
    <tr className="border-b border-base/40">
      <td className="px-3 py-2 font-bold text-muted">{label}</td>
      <td className={`px-3 py-2 text-right font-black ${tone}`}>{won(l)}</td>
      <td className={`px-3 py-2 text-right font-black ${tone}`}>{won(r)}</td>
      <td className={`px-3 py-2 text-right font-black ${tone}`}>{won(l + r)}</td>
    </tr>
  )
}

function TabAssetLoan() {
  const [master, setMaster] = useLs('finance:master', { house: 0, car: 0, coin: 0, savingsRate: 0 })
  const [rows, setRows] = useLs('finance:loan_rows', [])
  const list = Array.isArray(rows) ? rows : []

  const totalAsset = (Number(master?.house) || 0) + (Number(master?.car) || 0) + (Number(master?.coin) || 0)
  const last = list.length ? list[list.length - 1] : null
  const totalDebt = (Number(last?.bankLoanBalance) || 0) + (Number(last?.momLoanBalance) || 0)
  const updateMaster = (key, value) => setMaster((prev) => ({ ...(prev || {}), [key]: value }))
  const updateRow = (id, patch) => setRows((prev) => (Array.isArray(prev) ? prev : []).map((row) => (row.id === id ? { ...row, ...patch } : row)))
  const addRow = () => {
    const now = new Date()
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-25`
    setRows((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      {
        id: uid(),
        date,
        repaymentAmount: 0,
        interestRate: Number(last?.interestRate) || 0,
        interestAmount: 0,
        bankPrincipal: 0,
        bankLoanBalance: Number(last?.bankLoanBalance) || 0,
        momPrincipal: 0,
        momLoanBalance: Number(last?.momLoanBalance) || 0,
      },
    ])
  }
  const deleteRow = (id) => setRows((prev) => (Array.isArray(prev) ? prev : []).filter((row) => row.id !== id))

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card p-6">
        <h2 className="mb-4 text-xl font-bold text-asset">자산 설정</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <LabeledMoney label="집" value={master?.house} onChange={(v) => updateMaster('house', v)} />
          <LabeledMoney label="차량" value={master?.car} onChange={(v) => updateMaster('car', v)} />
          <LabeledMoney label="코인" value={master?.coin} onChange={(v) => updateMaster('coin', v)} />
          <LabeledMoney label="저축 이자율" value={master?.savingsRate} onChange={(v) => updateMaster('savingsRate', v)} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Kpi label="총 자산" value={won(totalAsset)} tone="text-asset" />
          <Kpi label="총 부채" value={won(totalDebt)} tone="text-red-300" />
          <Kpi label="순자산" value={won(totalAsset - totalDebt)} tone="text-sky-300" />
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-asset">월별 금융 기록</h2>
          <button onClick={addRow} className="btn min-h-0 bg-asset/20 px-4 py-2 text-asset hover:bg-asset/30">+ 행 추가</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="border-b border-base">
                {['날짜', '상환금액', '이자율(%)', '이자금액', '은행 원금', '은행 잔액', '엄마 원금', '엄마 잔액', '총 대출', '순자산', ''].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-3 text-left text-sm font-bold text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-muted">저장된 대출 기록이 없습니다.</td>
                </tr>
              )}
              {list.map((row) => {
                const rowDebt = (Number(row.bankLoanBalance) || 0) + (Number(row.momLoanBalance) || 0)
                const rowNetWorth = totalAsset - rowDebt
                return (
                  <tr key={row.id} className="border-b border-base/40 hover:bg-base/30">
                    <td className="px-1.5 py-2"><input type="date" value={row.date || ''} onChange={(e) => updateRow(row.id, { date: e.target.value })} className="w-36 rounded-lg bg-base px-2 py-2.5 text-base font-semibold text-soft" /></td>
                    <td className="px-1.5 py-2"><MoneyInput value={row.repaymentAmount} onChange={(v) => updateRow(row.id, { repaymentAmount: v })} className="w-32" /></td>
                    <td className="px-1.5 py-2"><MoneyInput value={row.interestRate} onChange={(v) => updateRow(row.id, { interestRate: v })} className="w-24" /></td>
                    <td className="px-1.5 py-2"><MoneyInput value={row.interestAmount} onChange={(v) => updateRow(row.id, { interestAmount: v })} className="w-32" /></td>
                    <td className="px-1.5 py-2"><MoneyInput value={row.bankPrincipal} onChange={(v) => updateRow(row.id, { bankPrincipal: v })} className="w-32" /></td>
                    <td className="px-1.5 py-2"><MoneyInput value={row.bankLoanBalance} onChange={(v) => updateRow(row.id, { bankLoanBalance: v })} className="w-36" /></td>
                    <td className="px-1.5 py-2"><MoneyInput value={row.momPrincipal} onChange={(v) => updateRow(row.id, { momPrincipal: v })} className="w-32" /></td>
                    <td className="px-1.5 py-2"><MoneyInput value={row.momLoanBalance} onChange={(v) => updateRow(row.id, { momLoanBalance: v })} className="w-36" /></td>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-red-300">{won(rowDebt)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-sky-300">{won(rowNetWorth)}</td>
                    <td className="px-2 py-2 text-center"><button onClick={() => deleteRow(row.id)} className="text-lg font-bold text-muted hover:text-red-400" aria-label="삭제">✕</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TabAnnualEvents() {
  const [events, setEvents] = useLs('finance:annual_events', seedEvents)
  const list = normalizeEvents(events)

  const totalPlan = list.reduce((s, e) => s + (Number(e.planAmount) || 0), 0)
  const totalActual = list.reduce((s, e) => s + (Number(e.actualAmount) || 0), 0)

  const up = (id, patch) => setEvents((prev) => normalizeEvents(prev).map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const add = () => setEvents((prev) => [...normalizeEvents(prev), { id: uid(), name: '', planAmount: 0, actualAmount: 0, memo: '' }])
  const del = (id) => setEvents((prev) => normalizeEvents(prev).filter((e) => e.id !== id))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Kpi label="연간 예산" value={won(totalPlan)} tone="text-asset" />
        <Kpi label="연간 실제" value={won(totalActual)} tone="text-red-300" />
        <Kpi label="예산-실제" value={won(totalPlan - totalActual)} tone="text-sky-300" />
      </div>
      <div className="rounded-2xl bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-asset">연간 보너스&경조사</h2>
          <button onClick={add} className="btn min-h-0 bg-asset/20 px-4 py-2 text-asset hover:bg-asset/30">+ 항목 추가</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="border-b border-base">
                <th className="whitespace-nowrap px-3 py-3 text-left text-sm font-bold text-muted">항목</th>
                <th className="whitespace-nowrap px-3 py-3 text-right text-sm font-bold text-muted">예산</th>
                <th className="whitespace-nowrap px-3 py-3 text-right text-sm font-bold text-muted">실제</th>
                <th className="whitespace-nowrap px-3 py-3 text-right text-sm font-bold text-muted">차이</th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-sm font-bold text-muted">메모</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">저장된 연간 항목이 없습니다.</td>
                </tr>
              )}
              {list.map((e) => {
                const diff = (Number(e.planAmount) || 0) - (Number(e.actualAmount) || 0)
                return (
                  <tr key={e.id} className="border-b border-base/40 hover:bg-base/30">
                    <td className="px-1.5 py-2">
                      <input value={e.name} onChange={(ev) => up(e.id, { name: ev.target.value })} className="min-w-[180px] rounded-lg bg-base px-3 py-2.5 text-base font-semibold text-soft" placeholder="항목명" />
                    </td>
                    <td className="px-1.5 py-2"><MoneyInput value={e.planAmount} onChange={(v) => up(e.id, { planAmount: v })} className="w-36" /></td>
                    <td className="px-1.5 py-2"><MoneyInput value={e.actualAmount} onChange={(v) => up(e.id, { actualAmount: v })} className="w-36" /></td>
                    <td className={`whitespace-nowrap px-3 py-2 text-right font-bold ${diff >= 0 ? 'text-sky-300' : 'text-red-300'}`}>{won(diff)}</td>
                    <td className="px-1.5 py-2">
                      <input value={e.memo} onChange={(ev) => up(e.id, { memo: ev.target.value })} className="min-w-[180px] rounded-lg bg-base px-3 py-2.5 text-base font-semibold text-soft" placeholder="메모" />
                    </td>
                    <td className="px-2 py-2 text-center"><button onClick={() => del(e.id)} className="text-lg font-bold text-muted hover:text-red-400" aria-label="삭제">✕</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function LabeledMoney({ label, value, onChange }) {
  return (
    <div className="rounded-xl bg-base p-4">
      <p className="mb-2 text-sm font-bold text-muted">{label}</p>
      <MoneyInput value={value} onChange={onChange} className="w-full" />
    </div>
  )
}

function Kpi({ label, value, tone = 'text-soft' }) {
  return (
    <div className="rounded-xl bg-base p-4">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className={`mt-1 text-xl font-black ${tone}`}>{value}</p>
    </div>
  )
}
