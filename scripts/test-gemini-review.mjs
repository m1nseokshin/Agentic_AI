const key = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash'

const SYSTEM = `너는 아이디어 공모전의 1차 검토를 돕는 심사 보조원이다.
주어지는 "아이디어 제목 / 아이디어 요약 / 기대 효과"만 읽고 다음 세 가지를 만든다.
너의 결과는 최종 심사가 아니라 사람이 볼 "검토 초안"이다.

[분야] 아래 5개 중 정확히 하나만 고른다. 반드시 주어진 영문 코드로만 답한다.
  - learning  : 학습·교육 (강의·과제·학습 지원, 교육 접근성)
  - campus    : 캠퍼스생활 (시설·행정·교통·식당 등 교내 편의)
  - community : 지역·커뮤니티 (지역 문제, 주민·상권·복지)
  - green     : 환경·지속가능 (에너지·폐기물·기후, ESG)
  - etc       : 기타·융합 (위에 안 맞거나 여러 분야 융합)
  애매하면 가장 가까운 하나를 고르고, 끝까지 하나만 고른다.

[평점] 1~5 사이의 "정수"만 낸다. 0이나 소수점은 쓰지 않는다.
  심사 축은 (1) 창의성 (2) 실현가능성 (3) 기대효과이며, 세 축을 종합해 하나의 점수를 낸다.
  기준: 5=매우 우수, 4=우수, 3=보통, 2=미흡, 1=매우 미흡.
  같은 답에 "그렇게 본 근거"를 한국어 한 줄(60자 이내)로 함께 낸다.
  근거에는 어느 축이 강점/약점인지 드러나게 쓴다.

[심사평 초안] 한국어로, 강점 2가지와 보완할 점 2가지를 담아 "다섯 문장 이내"로 쓴다.
  - 사실을 지어내지 않는다. 주어진 내용에 근거해서만 쓴다.
  - 최종 심사가 사람임을 전제로, 단정하지 말고 제안하는 어조로 쓴다.

[출력 형식] 설명·인사말·코드블록 없이 아래 JSON 객체 하나만 출력한다.
{"category":"<learning|campus|community|green|etc>","score":<1~5 정수>,"score_reason":"<한 줄 근거>","review":"<강점2·보완2, 5문장 이내 심사평 초안>"}`

const USER = `[아이디어 제목]
빈 강의실 실시간 안내 봇

[아이디어 요약]
학생이 비어 있는 강의실을 실시간으로 찾아 공부할 수 있게 하는 챗봇. 시간표·출입 데이터를 AI가 분석해 빈 좌석을 추천한다.

[기대 효과]
공부할 곳을 못 찾는 시간을 줄이고, 유휴 강의실 활용률을 높인다.`

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  signal: AbortSignal.timeout(120000),
  body: JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: USER }] }],
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
  }),
})
console.log('status:', res.status)
const data = await res.json()
if (!res.ok) { console.log(JSON.stringify(data).slice(0, 600)); process.exit(1) }
const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
console.log('raw output:\n' + text)
try {
  const obj = JSON.parse(text)
  console.log('\nparsed:', JSON.stringify(obj))
  console.log('valid category:', ['learning', 'campus', 'community', 'green', 'etc'].includes(obj.category))
  console.log('valid score:', Number.isInteger(obj.score) && obj.score >= 1 && obj.score <= 5)
} catch (e) {
  console.log('\nJSON 파싱 실패:', String(e))
}
