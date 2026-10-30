import { useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AiDraftNotice from '@/components/AiDraftNotice'

type FormValues = {
  TeamName: string
  Members: string
  IdeaTitle: string
  IdeaSummary: string
  ExpectedImpact: string
  Phone: string
  Email: string
}

const EMPTY: FormValues = {
  TeamName: '',
  Members: '',
  IdeaTitle: '',
  IdeaSummary: '',
  ExpectedImpact: '',
  Phone: '',
  Email: '',
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

function validate(v: FormValues): Record<string, string> {
  const e: Record<string, string> = {}
  if (!v.TeamName.trim()) e.TeamName = '팀명을 입력하세요.'
  if (!v.Members.trim()) e.Members = '구성원을 입력하세요.'
  if (!v.IdeaTitle.trim()) e.IdeaTitle = '아이디어 제목을 입력하세요.'
  if (!v.IdeaSummary.trim()) e.IdeaSummary = '아이디어 요약을 입력하세요.'
  else if (v.IdeaSummary.trim().length < 30) e.IdeaSummary = '아이디어 요약은 30자 이상이어야 합니다.'
  if (!v.ExpectedImpact.trim()) e.ExpectedImpact = '기대 효과를 입력하세요.'
  if (!v.Phone.trim()) e.Phone = '전화번호를 입력하세요.'
  else if (!/^[0-9+\-()\s]{8,}$/.test(v.Phone.trim())) e.Phone = '전화번호 형식을 확인하세요.'
  if (!v.Email.trim()) e.Email = '메일 주소를 입력하세요.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.Email.trim())) e.Email = '메일 주소 형식을 확인하세요.'
  return e
}

export default function Apply() {
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  function set<K extends keyof FormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validate(values)
    if (!consent) found.consent = '개인정보 수집·이용에 동의해 주세요.'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setStatus('submitting')
    setMessage('')
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data?.message || '접수에 실패했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
      setStatus('success')
      setMessage('접수되었습니다. AI 1차 검토 초안이 함께 저장되었습니다.')
      setValues(EMPTY)
      setConsent(false)
    } catch {
      setStatus('error')
      setMessage('접수에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">응모하기</h1>
        <p className="text-muted-foreground">
          다섯 가지 항목과 연락처를 입력해 주세요. 아이디어 요약이 AI 검토의 주 재료입니다.
        </p>
      </div>

      {status === 'success' && (
        <Alert>
          <AlertTitle>접수 완료</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertTitle>접수 실패</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>응모 정보</CardTitle>
          <CardDescription>모든 항목은 필수입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <Field label="팀명" htmlFor="TeamName" error={errors.TeamName}>
              <Input
                id="TeamName"
                value={values.TeamName}
                onChange={(e) => set('TeamName', e.target.value)}
                placeholder="예: 캠퍼스클린"
              />
            </Field>

            <Field
              label="구성원 (이름만)"
              htmlFor="Members"
              error={errors.Members}
              hint="공개 화면에 표시되지 않습니다."
            >
              <Input
                id="Members"
                value={values.Members}
                onChange={(e) => set('Members', e.target.value)}
                placeholder="예: 김철수, 이영희"
              />
            </Field>

            <Field label="아이디어 제목" htmlFor="IdeaTitle" error={errors.IdeaTitle}>
              <Input
                id="IdeaTitle"
                value={values.IdeaTitle}
                onChange={(e) => set('IdeaTitle', e.target.value)}
                placeholder="한 줄로 요약해 주세요"
              />
            </Field>

            <Field
              label="아이디어 요약"
              htmlFor="IdeaSummary"
              error={errors.IdeaSummary}
              hint="어떤 불편을, AI로 어떻게 푸는지 30자 이상"
            >
              <Textarea
                id="IdeaSummary"
                value={values.IdeaSummary}
                onChange={(e) => set('IdeaSummary', e.target.value)}
                placeholder="어떤 불편을, AI로 어떻게 푸는지 적어주세요."
                rows={5}
              />
            </Field>

            <Field label="기대 효과" htmlFor="ExpectedImpact" error={errors.ExpectedImpact}>
              <Textarea
                id="ExpectedImpact"
                value={values.ExpectedImpact}
                onChange={(e) => set('ExpectedImpact', e.target.value)}
                placeholder="누가 얼마나 좋아지는지"
                rows={4}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="연락처 (전화)"
                htmlFor="Phone"
                error={errors.Phone}
                hint="비공개, 회신용"
              >
                <Input
                  id="Phone"
                  inputMode="tel"
                  value={values.Phone}
                  onChange={(e) => set('Phone', e.target.value)}
                  placeholder="010-0000-0000"
                />
              </Field>

              <Field
                label="연락처 (메일)"
                htmlFor="Email"
                error={errors.Email}
                hint="비공개, 회신용"
              >
                <Input
                  id="Email"
                  type="email"
                  value={values.Email}
                  onChange={(e) => set('Email', e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(c) => setConsent(c === true)}
                />
                <Label htmlFor="consent" className="text-sm font-normal leading-snug">
                  [필수] 개인정보(연락처)는 회신 목적으로만 사용하며 공개 화면에 표시하지 않는 것에
                  동의합니다.
                </Label>
              </div>
              {errors.consent && <p className="text-sm text-destructive">{errors.consent}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={status === 'submitting'}>
              {status === 'submitting' ? '검토 중…' : '응모 제출'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AiDraftNotice />
    </div>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
