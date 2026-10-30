export type ReviewInput = {
  IdeaTitle: string
  IdeaSummary: string
  ExpectedImpact: string
}

export type Review = {
  category: string
  score: number
  scoreReason: string
  review: string
}

export const CATEGORY_CODES = ['learning', 'campus', 'community', 'green', 'etc'] as const

const SYSTEM_INSTRUCTION = `너는 아이디어 공모전의 1차 검토를 돕는 심사 보조원이다.
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

const CATEGORY_LABEL: Record<string, string> = {
  learning: '학습·교육',
  campus: '캠퍼스생활',
  community: '지역·커뮤니티',
  green: '환경·지속가능',
  etc: '기타·융합',
}

export function categoryToLabel(code: string): string | null {
  return CATEGORY_LABEL[code] ?? null
}

function buildUserContent(input: ReviewInput): string {
  return `[아이디어 제목]\n${input.IdeaTitle}\n\n[아이디어 요약]\n${input.IdeaSummary}\n\n[기대 효과]\n${input.ExpectedImpact}`
}

/**
 * Gemini로 1차 검토 초안을 생성한다. 실패하면 null을 반환한다(자동 재시도 없음).
 * 개인정보(팀명·구성원·연락처)는 전달하지 않는다.
 */
export async function reviewWithGemini(input: ReviewInput): Promise<Review | null> {
  const key = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL
  if (!key || !model) {
    console.error('[gemini] GEMINI_API_KEY/GEMINI_MODEL 미설정')
    return null
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: 'user', parts: [{ text: buildUserContent(input) }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    )

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[gemini] 호출 실패 ${res.status}: ${detail.slice(0, 200)}`)
      return null
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    if (!text) return null

    const parsed = JSON.parse(text) as {
      category?: unknown
      score?: unknown
      score_reason?: unknown
      review?: unknown
    }

    const category = typeof parsed.category === 'string' ? parsed.category : ''
    const score = typeof parsed.score === 'number' ? parsed.score : Number.NaN
    const scoreReason = typeof parsed.score_reason === 'string' ? parsed.score_reason.trim() : ''
    const review = typeof parsed.review === 'string' ? parsed.review.trim() : ''

    if (!CATEGORY_CODES.includes(category as (typeof CATEGORY_CODES)[number])) {
      console.error('[gemini] 유효하지 않은 분야:', category)
      return null
    }
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      console.error('[gemini] 유효하지 않은 평점:', score)
      return null
    }
    if (!scoreReason || !review) return null

    return { category, score, scoreReason, review }
  } catch (err) {
    console.error('[gemini] 오류:', err)
    return null
  }
}
