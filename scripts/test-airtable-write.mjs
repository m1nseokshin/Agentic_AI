const token = process.env.AIRTABLE_TOKEN
let baseId = (process.env.AIRTABLE_BASE_ID || '').trim().replace(/^https?:\/\/[^/]+\//, '')
const m = baseId.match(/app[A-Za-z0-9]{14}/)
if (m) baseId = m[0]
const table = process.env.AIRTABLE_TABLE_NAME || 'Applications'
const API = 'https://api.airtable.com/v0'
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

const fields = {
  TeamName: 'TEST-가상팀',
  Members: '테스트1, 테스트2',
  IdeaTitle: '가상 아이디어 (검증용)',
  IdeaSummary: 'API 쓰기 권한과 필드명을 확인하기 위한 가상 응모입니다.',
  ExpectedImpact: '검증 후 삭제됩니다.',
  Phone: '010-0000-0000',
  Email: 'test@example.com',
  SubmittedAt: new Date().toISOString(),
  AICategory: '학습·교육',
  AIScore: 3,
  AIScoreReason: '검증용 한 줄 근거',
  AIReviewDraft: '검증용 초안입니다. 강점 두 가지와 보완 두 가지를 담습니다.',
  JudgeScore: 3,
}

const createRes = await fetch(`${API}/${baseId}/${encodeURIComponent(table)}`, {
  method: 'POST',
  headers: H,
  body: JSON.stringify({ fields }),
})
console.log('create status:', createRes.status)
const created = await createRes.json()
if (!createRes.ok) { console.log(JSON.stringify(created).slice(0, 400)); process.exit(1) }
console.log('created id:', created.id)

const delRes = await fetch(`${API}/${baseId}/${encodeURIComponent(table)}/${created.id}`, {
  method: 'DELETE',
  headers: H,
})
console.log('delete status:', delRes.status)
console.log(delRes.ok ? 'OK: 쓰기·삭제 정상' : (await delRes.text()).slice(0, 300))
