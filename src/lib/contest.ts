export const CONTEST = {
  name: '2026 AI 아이디어 공모전',
  tagline: '캠퍼스·지역 문제 해결',
  period: '2026-11-03 ~ 2026-11-30',
  periodLabel: '접수 4주',
  prize: '총상금 200만원',
  eligibility: '재학생·휴학생 (개인 또는 팀)',
  schedule: [
    { label: '접수', value: '2026-11-03 ~ 11-30 (4주)' },
    { label: '1차 검토 (AI 초안)', value: '접수 즉시 자동' },
    { label: '사람 심사', value: '2026-12-01 ~ 12-07' },
    { label: '발표', value: '2026-12-11' },
  ],
  awards: '대상 1팀 80만원 · 최우수 2팀 각 40만원 · 우수 3팀 각 20만원 · 장려 다수 기념품',
  criteria: [
    { title: '창의성', desc: '기존에 없던 접근인가, 문제를 새롭게 정의했는가' },
    { title: '실현가능성', desc: '지금 있는 도구·데이터·예산으로 실제 만들 수 있는가' },
    { title: '기대효과', desc: '해결되면 누가 얼마나 좋아지는가, 파급 범위는' },
  ],
} as const

export const CATEGORIES = [
  { code: 'learning', label: '학습·교육' },
  { code: 'campus', label: '캠퍼스생활' },
  { code: 'community', label: '지역·커뮤니티' },
  { code: 'green', label: '환경·지속가능' },
  { code: 'etc', label: '기타·융합' },
] as const

export type CategoryCode = (typeof CATEGORIES)[number]['code']

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.code, c.label]),
)

export const AI_DRAFT_NOTICE = 'AI 평점·심사평은 검토 초안이며, 최종 심사는 사람이 합니다.'
