import Link from 'next/link'
import { ArrowRight, Clock, HelpCircle, Sparkles, Users } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkillBadge } from './skill-badge'
import { DifficultyBadge } from './difficulty-badge'
import type { Exam } from '@/lib/types'

interface ExamCardProps {
  exam: Exam
}

function formatAttempts(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <Card className="relative flex flex-col border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10 focus-within:ring-3 focus-within:ring-ring/20">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true" />
      <CardHeader className="pb-3 pt-5">
        <div className="flex flex-wrap items-center gap-1.5 pb-2">
          <SkillBadge skill={exam.skill} />
          <DifficultyBadge difficulty={exam.difficulty} />
          <Badge variant="outline" className="border-brand-orange/30 bg-brand-orange-light text-brand-orange text-xs font-extrabold">
            TOEIC
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-lg font-extrabold leading-snug text-foreground">{exam.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm leading-relaxed">
          {exam.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <dl className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/50 p-2 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1 rounded-md px-1 py-2">
            <HelpCircle className="size-3.5 text-primary" aria-hidden="true" />
            <dt>Questions</dt>
            <dd className="font-black text-foreground">{exam.questionCount}</dd>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-md px-1 py-2">
            <Clock className="size-3.5 text-primary" aria-hidden="true" />
            <dt>Timer</dt>
            <dd className="font-black text-foreground">{exam.timeLimitMinutes}'</dd>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-md px-1 py-2">
            <Users className="size-3.5 text-primary" aria-hidden="true" />
            <dt>Attempts</dt>
            <dd className="font-black text-foreground">{formatAttempts(exam.attempts)}</dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 bg-muted/35 p-3">
        <Button render={<Link href={`/exam/${exam.id}?mode=practice`} />} nativeButton={false} className="w-full" size="sm">
          <Sparkles data-icon="inline-start" />
          Practice
        </Button>
        <Button render={<Link href={`/exam/${exam.id}?mode=real-test`} />} nativeButton={false} variant="outline" className="w-full border-primary/30 text-primary hover:bg-secondary" size="sm">
          Test
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  )
}
