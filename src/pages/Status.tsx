import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AiDraftNotice from '@/components/AiDraftNotice'

type CategoryCount = { label: string; count: number }
type StatusData = {
  ok: true
  total: number
  byCategory: CategoryCount[]
  uncategorized: number
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: StatusData }
  | { status: 'error'; message: string }

export default function Status() {
  const [state, setState] = useState<State>({ status: 'idle' })

  async function load() {
    setState({ status: 'loading' })
    try {
      const res = await fetch('/api/status')
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setState({ status: 'error', message: data?.message || '현황을 불러오지 못했습니다.' })
        return
      }
      setState({ status: 'success', data })
    } catch {
      setState({ status: 'error', message: '현황을 불러오지 못했습니다.' })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">접수 현황</h1>
          <p className="text-muted-foreground">
            분야별 접수 건수입니다. 이름·연락처는 공개하지 않습니다.
          </p>
        </div>
        <Button onClick={load} disabled={state.status === 'loading'}>
          <RefreshCw className={state.status === 'loading' ? 'animate-spin' : ''} />
          {state.status === 'loading' ? '불러오는 중…' : '새로고침'}
        </Button>
      </div>

      {state.status === 'idle' && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            새로고침을 눌러 현황을 확인하세요.
          </CardContent>
        </Card>
      )}

      {state.status === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.status === 'success' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                총 {state.data.total}건
                {state.data.uncategorized > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (미분류 {state.data.uncategorized}건)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.data.byCategory.map((c) => {
                const pct = state.data.total > 0 ? Math.round((c.count / state.data.total) * 100) : 0
                return (
                  <div key={c.label} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>{c.label}</span>
                      <span className="text-muted-foreground">
                        {c.count}건 · {pct}%
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                )
              })}
            </CardContent>
          </Card>
          {state.data.total === 0 && (
            <p className="text-center text-sm text-muted-foreground">아직 접수된 응모가 없습니다.</p>
          )}
        </>
      )}

      <AiDraftNotice />
    </div>
  )
}
