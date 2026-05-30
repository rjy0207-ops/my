# 나만의 대시보드 (My Personal Dashboard)

자산·투자·커리어·주거·여가를 한 곳에서 보는 개인용 풀스택 반응형 대시보드.
자세한 요구사항은 [`prd.md`](./prd.md) 참고.

## 기술 스택
- **Frontend:** React 18 + Vite + Tailwind CSS (다크 테마, PWA)
- **DB:** Supabase (PostgreSQL / JSONB)
- **Backend:** Vercel Serverless (API Routes) — Claude API 중계 + 호출 안전장치
- **Automation:** n8n (데일리 크롤러 + LLM 파이프라인)
- **Deploy:** Vercel

## 로컬 실행
```bash
npm install
cp .env.example .env   # 값 채우기 (Windows: copy .env.example .env)
npm run dev            # http://localhost:5173
```
> `.env` 의 `VITE_DASHBOARD_PASSWORD` 가 인증창 비밀번호입니다.
> Supabase 키를 비워두면 "DB 미연결" 배너가 뜨고 UI 만 동작합니다.

## DB 셋업 (2단계)
Supabase 프로젝트 생성 후 `supabase/migrations/0001_init.sql` 을
SQL Editor 에 붙여넣어 실행.

## 진행 현황 (로드맵)
- [x] **1단계** 프로젝트 셋업: Vite+React+Tailwind, 다크테마, 인증 게이트, 2×3 그리드, PWA, DB 스키마 초안
- [x] **2단계** 자산 모듈 CRUD: Supabase/localStorage 폴백 repo, 순자산 자동계산, 상세 편집 모달
- [x] **3단계** 카드 확장: 투자·집·여행·차(공용 CollectionCard) + 나의 미래(커리어 타임라인·D-day·이력서)
- [x] **4단계** AI: Vercel 서버리스 `/api/claude`(Opus 4.8, 프롬프트 캐싱, 하루 호출 한도) + 자산 재무 리뷰 🤖 + AI Agent 강의 진척도·프롬프트 샌드박스
- [ ] **5단계** n8n 데일리 파이프라인 + 스크랩 보관함

## AI 기능 로컬 테스트 (4단계)
`/api/claude` 는 Vercel 서버리스 함수라 일반 `npm run dev` 에서는 실행되지 않습니다(404 시 안내 표시).
실제 호출을 로컬에서 보려면:
```bash
npm i -g vercel
vercel dev            # ANTHROPIC_API_KEY 등 .env 로딩
```
배포 환경(Vercel)에서는 대시보드 설정의 환경변수로 키를 주입하세요.

## 보안 메모
- 레포는 **Private** 유지. `.env` 절대 커밋 금지.
- `ANTHROPIC_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 는 서버 전용 (VITE_ 접두사 금지).
