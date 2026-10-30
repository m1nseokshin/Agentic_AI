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
