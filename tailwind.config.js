/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // PRD 6절 디자인 가이드 컬러 토큰
        base: '#0F172A', // Deep Slate 배경
        card: '#1E293B', // 카드 배경
        soft: '#F1F5F9', // 소프트 화이트 텍스트
        muted: '#94A3B8', // 뮤티드 그레이
        // 카드별 액센트 (PRD 5절 레이아웃)
        asset: '#22C55E', // 자산 - 그린
        agent: '#6366F1', // AI Agent - 인디고
        house: '#F59E0B', // 나만의 집 - 앰버
        travel: '#38BDF8', // 여행 - 스카이블루
        future: '#3B82F6', // 나의 미래 - 코발트블루
        car: '#06B6D4', // 차 - 시안
      },
      fontSize: {
        // 모바일 가독성 우선: 본문 최소 16px
        base: ['16px', '1.6'],
        sub: ['18px', '1.5'],
        metric: ['28px', '1.2'],
      },
      minHeight: {
        touch: '44px', // 터치 영역 최소 44px
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
}
