import { createHash } from 'node:crypto'

const token = process.env.AIRTABLE_TOKEN
const baseId = process.env.AIRTABLE_BASE_ID
const tableName = process.env.AIRTABLE_TABLE_NAME

const present = {
  AIRTABLE_TOKEN: !!token,
  AIRTABLE_BASE_ID: !!baseId,
  AIRTABLE_TABLE_NAME: !!tableName,
  GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || null,
}
console.log('env presence:', JSON.stringify(present))
console.log('diag:', JSON.stringify({
  baseIdPrefix: baseId ? baseId.slice(0, 8) : null,
  baseIdLength: baseId ? baseId.length : 0,
  baseIdHasSpace: baseId ? /\s/.test(baseId) : null,
  baseIdStartsWithApp: baseId ? baseId.startsWith('app') : null,
  tokenPrefix: token ? token.slice(0, 3) : null,
  tokenLength: token ? token.length : 0,
  tokenHasSpace: token ? /\s/.test(token) : null,
  tokenSha: token ? createHash('sha256').update(token).digest('hex').slice(0, 12) : null,
}))

if (!token || !baseId || !tableName) {
  console.error('missing airtable env')
  process.exit(1)
}

async function probe(label, url) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  console.log(`${label}: ${r.status} ${r.ok ? 'OK' : (await r.text()).slice(0, 200)}`)
  return r
}

const metaRes = await probe('meta /schema', `https://api.airtable.com/v0/meta/bases/${baseId}/tables`)
const dataRes = await probe('data /records', `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1`)

if (!metaRes.ok) {
  console.error('\n-> meta 실패. 원인: ①토큰에 schema.bases:read 스코프 없음 ②베이스 ID 오타 ③토큰 Access에 이 베이스 미포함')
  process.exit(1)
}
const res = metaRes

const expected = [
  'TeamName', 'Members', 'IdeaTitle', 'IdeaSummary', 'ExpectedImpact',
  'Phone', 'Email', 'SubmittedAt', 'AICategory', 'AIScore', 'AIScoreReason',
  'AIReviewDraft', 'JudgeScore', 'MailSentAt',
]

const data = await res.json()
console.log('tables:', data.tables.map((t) => t.name).join(', '))
for (const t of data.tables) {
  console.log(`\n[${t.name}] fields:`)
  for (const f of t.fields) console.log(`  - ${f.name} :: ${f.type}${f.options?.choices ? ' :: ' + f.options.choices.map((c) => c.name).join('|') : ''}`)
}

const table = data.tables.find((t) => t.name === tableName)
if (!table) {
  console.error(`\ntable "${tableName}" not found`)
  process.exit(1)
}

const names = table.fields.map((f) => f.name)
const missing = expected.filter((n) => !names.includes(n))
const extra = names.filter((n) => !expected.includes(n))
console.log('\nmissing:', missing.length ? missing.join(', ') : 'none')
console.log('extra  :', extra.length ? extra.join(', ') : 'none')
