export type ApplicationInput = {
  TeamName: string
  Members: string
  IdeaTitle: string
  IdeaSummary: string
  ExpectedImpact: string
  Phone: string
  Email: string
}

const KEYS: (keyof ApplicationInput)[] = [
  'TeamName',
  'Members',
  'IdeaTitle',
  'IdeaSummary',
  'ExpectedImpact',
  'Phone',
  'Email',
]

export function parseString(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : ''
}

export function validate(body: unknown): { ok: true; value: ApplicationInput } | { ok: false; message: string } {
  if (!body || typeof body !== 'object') return { ok: false, message: '요청 형식이 올바르지 않습니다.' }
  const src = body as Record<string, unknown>
  const value = {} as ApplicationInput
  for (const key of KEYS) value[key] = parseString(src[key])

  if (!value.TeamName) return { ok: false, message: '팀명을 입력하세요.' }
  if (!value.Members) return { ok: false, message: '구성원을 입력하세요.' }
  if (!value.IdeaTitle) return { ok: false, message: '아이디어 제목을 입력하세요.' }
  if (value.IdeaSummary.length < 30) return { ok: false, message: '아이디어 요약은 30자 이상이어야 합니다.' }
  if (!value.ExpectedImpact) return { ok: false, message: '기대 효과를 입력하세요.' }
  if (!/^[0-9+\-()\s]{8,}$/.test(value.Phone)) return { ok: false, message: '전화번호 형식을 확인하세요.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.Email)) return { ok: false, message: '메일 주소 형식을 확인하세요.' }

  return { ok: true, value }
}
