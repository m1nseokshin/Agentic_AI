import type { VercelRequest, VercelResponse } from '@vercel/node'
import { listCategories } from './_lib/airtable.js'

export const config = { maxDuration: 30 }

const CATEGORY_LABELS = ['학습·교육', '캠퍼스생활', '지역·커뮤니티', '환경·지속가능', '기타·융합']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    return
  }

  try {
    const categories = await listCategories()
    const counts = new Map<string, number>(CATEGORY_LABELS.map((l) => [l, 0]))
    let uncategorized = 0
    for (const c of categories) {
      if (c && counts.has(c)) counts.set(c, (counts.get(c) ?? 0) + 1)
      else uncategorized += 1
    }

    res.status(200).json({
      ok: true,
      total: categories.length,
      byCategory: CATEGORY_LABELS.map((label) => ({ label, count: counts.get(label) ?? 0 })),
      uncategorized,
    })
  } catch (err) {
    console.error('[status] 조회 실패:', err)
    res.status(502).json({ ok: false, message: '현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' })
  }
}
