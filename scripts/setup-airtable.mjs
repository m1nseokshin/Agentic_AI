const token = process.env.AIRTABLE_TOKEN
let baseId = (process.env.AIRTABLE_BASE_ID || '').trim().replace(/^https?:\/\/[^/]+\//, '')
{
  const appMatch = baseId.match(/app[A-Za-z0-9]{14}/)
  if (appMatch) baseId = appMatch[0]
  else {
    const seg = baseId.split('/')[0].replace(/[^A-Za-z0-9]/g, '')
    if (/^[A-Za-z0-9]{14}$/.test(seg)) baseId = 'app' + seg
  }
}
console.log('baseId:', baseId)

const TABLE_NAME = 'Applications'
const API = 'https://api.airtable.com/v0'
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

const CHOICES = ['학습·교육', '캠퍼스생활', '지역·커뮤니티', '환경·지속가능', '기타·융합']
const dateOpts = { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'client' }

const expected = [
  { name: 'TeamName', type: 'singleLineText' },
  { name: 'Members', type: 'singleLineText' },
  { name: 'IdeaTitle', type: 'singleLineText' },
  { name: 'IdeaSummary', type: 'multilineText' },
  { name: 'ExpectedImpact', type: 'multilineText' },
  { name: 'Phone', type: 'phoneNumber' },
  { name: 'Email', type: 'email' },
  { name: 'SubmittedAt', type: 'dateTime', options: dateOpts },
  { name: 'AICategory', type: 'singleSelect', options: { choices: CHOICES.map((name) => ({ name })) } },
  { name: 'AIScore', type: 'number', options: { precision: 0 } },
  { name: 'AIScoreReason', type: 'singleLineText' },
  { name: 'AIReviewDraft', type: 'multilineText' },
  { name: 'JudgeScore', type: 'number', options: { precision: 0 } },
  { name: 'MailSentAt', type: 'dateTime', options: dateOpts },
]

async function j(method, url, body) {
  const r = await fetch(url, { method, headers: H, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text()
  let d
  try { d = JSON.parse(t) } catch { d = t }
  if (!r.ok) throw new Error(`${method} ${url.split('/v0')[1]} -> ${r.status} ${JSON.stringify(d).slice(0, 300)}`)
  return d
}

async function getTable() {
  const { tables } = await j('GET', `${API}/meta/bases/${baseId}/tables`)
  return tables.find((t) => t.name === TABLE_NAME) || tables[0]
}

let table = await getTable()
if (table.name !== TABLE_NAME) {
  console.log(`rename "${table.name}" -> "${TABLE_NAME}"`)
  await j('PATCH', `${API}/meta/bases/${baseId}/tables/${table.id}`, { name: TABLE_NAME })
  table = await getTable()
}

const primaryId = table.primaryFieldId
const primary = table.fields.find((f) => f.id === primaryId)
if (primary.name !== 'TeamName') {
  console.log(`rename primary "${primary.name}" -> "TeamName"`)
  await j('PATCH', `${API}/meta/bases/${baseId}/tables/${table.id}/fields/${primary.id}`, { name: 'TeamName' })
}

const existing = new Set(table.fields.map((f) => f.name))
for (const spec of expected) {
  if (spec.name === 'TeamName') continue
  if (existing.has(spec.name)) { console.log(`exists  ${spec.name}`); continue }
  const body = { name: spec.name, type: spec.type }
  if (spec.options) body.options = spec.options
  await j('POST', `${API}/meta/bases/${baseId}/tables/${table.id}/fields`, body)
  console.log(`created ${spec.name}`)
}

const keep = new Set(expected.map((e) => e.name))
for (const f of table.fields) {
  if (f.id === primaryId || keep.has(f.name)) continue
  try {
    await j('DELETE', `${API}/meta/bases/${baseId}/tables/${table.id}/fields/${f.id}`)
    console.log(`deleted ${f.name}`)
  } catch (e) {
    console.log(`could not delete ${f.name}: ${String(e).slice(0, 120)}`)
  }
}

const final = await getTable()
console.log(`\n[${final.name}] final fields:`)
for (const f of final.fields) {
  const extra = f.options?.choices
    ? ' :: ' + f.options.choices.map((c) => c.name).join('|')
    : (f.options?.precision !== undefined ? ' :: precision=' + f.options.precision : '')
  console.log(`  - ${f.name} :: ${f.type}${extra}`)
}
const names = final.fields.map((f) => f.name)
const missing = expected.map((e) => e.name).filter((n) => !names.includes(n))
console.log('\nmissing:', missing.length ? missing.join(', ') : 'none')
