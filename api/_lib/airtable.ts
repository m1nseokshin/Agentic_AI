const API = 'https://api.airtable.com/v0'

export type AirtableFields = Record<string, unknown>

export async function createRecord(fields: AirtableFields): Promise<{ id: string }> {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const table = process.env.AIRTABLE_TABLE_NAME
  if (!token || !baseId || !table) {
    throw new Error('Airtable 환경변수가 설정되지 않았습니다.')
  }

  const res = await fetch(`${API}/${baseId}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Airtable 저장 실패 ${res.status}: ${detail.slice(0, 200)}`)
  }
  return (await res.json()) as { id: string }
}

/** 분야 집계용으로 AICategory 필드만 가져온다. 개인정보는 조회하지 않는다. */
export async function listCategories(): Promise<(string | undefined)[]> {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const table = process.env.AIRTABLE_TABLE_NAME
  if (!token || !baseId || !table) {
    throw new Error('Airtable 환경변수가 설정되지 않았습니다.')
  }

  const categories: (string | undefined)[] = []
  let offset: string | undefined
  do {
    const url = new URL(`${API}/${baseId}/${encodeURIComponent(table)}`)
    url.searchParams.append('fields[]', 'AICategory')
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`Airtable 조회 실패 ${res.status}: ${detail.slice(0, 200)}`)
    }
    const data = (await res.json()) as {
      records: { fields: { AICategory?: string } }[]
      offset?: string
    }
    for (const r of data.records) categories.push(r.fields.AICategory)
    offset = data.offset
  } while (offset)

  return categories
}
