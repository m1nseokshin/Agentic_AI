// 가상 응모를 배포된 API로 제출해 전체 흐름을 점검한다. 실제 개인정보는 사용하지 않는다.
// 사용법: node scripts/seed-test-data.mjs [BASE_URL]
const BASE = process.argv[2] || 'https://agentic-ai-three-beta.vercel.app'

const samples = [
  {
    TeamName: '가상팀 그린',
    Members: '한지우',
    IdeaTitle: 'AI 캠퍼스 에너지 절약 코치',
    IdeaSummary:
      '건물별 전력 사용량을 AI가 분석해 낭비 구간을 찾아 절약 방법을 알려주는 캠퍼스 에너지 관리 서비스입니다. 절전을 게임처럼 독려합니다.',
    ExpectedImpact: '캠퍼스 전력 사용을 줄여 탄소 배출과 운영 비용을 함께 낮춥니다.',
    Phone: '010-1111-2222',
    Email: 'virtual.green@example.com',
  },
  {
    TeamName: '가상팀 융합',
    Members: '서준호, 임나래',
    IdeaTitle: 'AI 다국어 캠퍼스 안내 로봇',
    IdeaSummary:
      '유학생과 방문객을 위해 교내 시설 안내와 행정 절차를 여러 언어로 알려주는 AI 챗봇입니다. 길찾기와 민원 안내를 함께 처리합니다.',
    ExpectedImpact: '언어 장벽을 낮춰 유학생의 캠퍼스 적응을 돕고 행정 문의를 줄입니다.',
    Phone: '010-3333-4444',
    Email: 'virtual.mix@example.com',
  },
  {
    TeamName: '가상팀 스터디',
    Members: '강민서',
    IdeaTitle: 'AI 스터디 매칭 플랫폼',
    IdeaSummary:
      '관심 분야와 학습 목표가 비슷한 학생들을 AI가 매칭해 스터디 그룹을 만들어주는 서비스입니다. 시간표까지 고려해 모임 시간을 추천합니다.',
    ExpectedImpact: '학습 동기를 높이고 학생 간 교류를 늘려 학습 성과를 개선합니다.',
    Phone: '010-5555-6666',
    Email: 'virtual.study@example.com',
  },
  {
    TeamName: '가상팀 상권',
    Members: '윤도현, 백지수',
    IdeaTitle: 'AI 골목상권 유동인구 예측',
    IdeaSummary:
      '지역 축제와 학사 일정을 반영해 골목상권의 유동인구를 예측하고 상인에게 마케팅 타이밍을 제안하는 서비스입니다.',
    ExpectedImpact: '소상공인의 매출 기회를 넓히고 지역 상권을 활성화합니다.',
    Phone: '010-7777-8888',
    Email: 'virtual.market@example.com',
  },
]

for (const body of samples) {
  const t = Date.now()
  try {
    const res = await fetch(`${BASE}/api/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000),
    })
    const data = await res.json()
    console.log(
      `${res.status} ${((Date.now() - t) / 1000).toFixed(1)}s reviewed=${data.reviewed} aiError=${data.aiError ?? '-'} | ${body.TeamName}`,
    )
  } catch (e) {
    console.log(`ERR ${String(e).slice(0, 60)} | ${body.TeamName}`)
  }
}
