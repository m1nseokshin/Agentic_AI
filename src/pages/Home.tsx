import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Trophy, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import AiDraftNotice from '@/components/AiDraftNotice'
import { CONTEST } from '@/lib/contest'

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <Badge variant="secondary">
          접수 {CONTEST.period} · {CONTEST.prize}
        </Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI로, 우리 주변의 불편을 바꿉니다
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            캠퍼스와 부산 지역의 문제를 AI로 푸는 아이디어를 찾습니다. 당신의 아이디어가 1차
            검토를 거쳐 심사위원에게 닿습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/apply">
              응모하러 가기 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/status">접수 현황 보기</Link>
          </Button>
        </div>
      </section>

      <Separator />

      <section className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> 응모 자격
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {CONTEST.eligibility}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> 일정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {CONTEST.schedule.map((s) => (
              <div key={s.label} className="flex justify-between gap-4">
                <span>{s.label}</span>
                <span className="text-right">{s.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" /> 시상
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{CONTEST.awards}</CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">무엇을 모집하나요</h2>
        <p className="max-w-3xl text-muted-foreground">
          제품, 서비스, 정책, 자동화 도구 무엇이든 좋습니다. 아직 만들지 않아도 됩니다. "누구의
          어떤 불편을, AI로 어떻게 푸는가"가 분명하면 됩니다.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">심사 기준</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {CONTEST.criteria.map((c) => (
            <Card key={c.title}>
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
                <CardDescription>{c.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <AiDraftNotice />

      <section className="space-y-3 rounded-lg border bg-muted/40 p-5 text-sm text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">유의사항</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>AI가 붙이는 분야·평점·심사평은 검토 초안이며, 최종 심사는 사람이 합니다.</li>
          <li>응모자의 이름·연락처는 공개 화면(접수 현황)에 표시되지 않습니다.</li>
          <li>접수 현황에는 분야별 건수만 공개됩니다.</li>
        </ul>
      </section>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link to="/apply">
            지금 응모하기 <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
