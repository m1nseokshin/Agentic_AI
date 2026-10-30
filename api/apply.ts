import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createRecord } from './_lib/airtable.js'
import { validate } from './_lib/validation.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    return
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body
  const result = validate(body)
  if (!result.ok) {
    res.status(400).json({ ok: false, message: result.message })
    return
  }

  const v = result.value
  const fields = {
    TeamName: v.TeamName,
    Members: v.Members,
    IdeaTitle: v.IdeaTitle,
    IdeaSummary: v.IdeaSummary,
    ExpectedImpact: v.ExpectedImpact,
    Phone: v.Phone,
    Email: v.Email,
    SubmittedAt: new Date().toISOString(),
  }

  try {
    const record = await createRecord(fields)
    res.status(200).json({ ok: true, id: record.id })
  } catch (err) {
    console.error('[apply] 저장 실패:', err)
    res.status(502).json({ ok: false, message: '접수 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.' })
  }
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
