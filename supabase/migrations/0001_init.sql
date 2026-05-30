-- ============================================================
-- 나만의 대시보드 초기 스키마 (PRD 2단계)
-- Supabase SQL Editor 에 붙여넣어 실행하거나 supabase CLI 로 적용.
-- ============================================================

-- 1. 자산/부채 (F-01)
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  type text not null,            -- 집 / 차 / 코인 / 주식 / 현금 등
  name text not null,
  value numeric not null default 0,
  is_liability boolean not null default false,
  detail jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. 자금 흐름: 월수입·고정비·보너스 (F-01)
create table if not exists cashflow (
  id uuid primary key default gen_random_uuid(),
  category text not null,        -- 수입 / 고정비 / 보너스활용
  label text not null,
  amount numeric not null default 0,
  month date,                    -- 해당 월 (선택)
  updated_at timestamptz not null default now()
);

-- 3. 투자 관망 노트: 6대 자산 (GNB 투자 탭)
create table if not exists investments (
  id uuid primary key default gen_random_uuid(),
  category text not null,        -- 부동산/금/btc/알트/주식/해외주식
  memo text,
  watchlist jsonb default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 4. 커리어 타임라인 (F-05)
create table if not exists career_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  status text not null default 'future', -- past / present / future
  detail jsonb default '{}'::jsonb,
  sort_order int default 0
);

-- 5. 이력서 (F-05)
create table if not exists resume (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 6. 주거 분석 (F-03)
create table if not exists housing (
  id uuid primary key default gen_random_uuid(),
  type text not null,            -- 현재주거 / 단독주택스크랩 / 스타일링
  title text not null,
  detail jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 7. 여행 (F-04)
create table if not exists travel (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'history', -- history / recommend
  itinerary jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 8. 차 / EV 피드 (F-06)
create table if not exists cars (
  id uuid primary key default gen_random_uuid(),
  brand text,
  model text not null,
  info jsonb default '{}'::jsonb,
  is_featured boolean default false,
  updated_at timestamptz not null default now()
);

-- 9. n8n 데일리 피드: 매일 덮어쓰기 (F-07)
create table if not exists daily_feed (
  id uuid primary key default gen_random_uuid(),
  source text not null,          -- house / car
  summary text,                  -- LLM 정제 "오늘의 한 줄 평"
  raw jsonb default '{}'::jsonb,
  fetched_at timestamptz not null default now()
);

-- 10. 스크랩 보관함: 반영구 누적 (F-07)
create table if not exists saved_items (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  snapshot jsonb not null,
  saved_at timestamptz not null default now()
);

-- 11. Claude 호출 로그: 하루 카운트 안전장치 (제약사항 3)
create table if not exists ai_call_log (
  id uuid primary key default gen_random_uuid(),
  endpoint text,
  tokens int,
  called_at timestamptz not null default now()
);

-- ── RLS: 1인 전용. 우선 익명 anon 키로 접근하므로 정책을 명시적으로 둔다.
-- 추후 Supabase Auth 승격 시 auth.uid() 기반으로 강화할 것.
-- (개발 초기에는 아래를 주석 처리하고 진행해도 무방)
-- alter table assets enable row level security;
-- create policy "owner full access" on assets for all using (true) with check (true);
