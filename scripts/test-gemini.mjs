const key = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL
if (!key) { console.error('GEMINI_API_KEY 없음'); process.exit(1) }

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
console.log('list status:', res.status)
const data = await res.json()
if (!res.ok) { console.log(JSON.stringify(data).slice(0, 500)); process.exit(1) }

const names = (data.models || []).map((m) => m.name.replace(/^models\//, ''))
console.log('사용 가능한 모델 수:', names.length)
const flash = names.filter((n) => /flash/i.test(n))
console.log('flash 계열:', flash.join(', ') || '(없음)')
console.log('설정된 GEMINI_MODEL:', model)
console.log('설정값 존재 여부:', names.includes(model) ? '정확히 일치함' : (names.some((n) => n.startsWith(model || '@')) ? '접두 일치' : '일치하는 모델 없음'))
