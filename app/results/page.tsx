import Link from 'next/link'
import { Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { SkillBadge } from '@/components/skill-badge'
import { getUserResults } from '@/lib/data-service'
import { formatDuration, scoreBand } from '@/lib/grading'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Results — YouPass English',
  description: 'View your exam history and track your progress over time.',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function ResultsPage() {
  const results = await getUserResults()

  // Summary stats
  const totalAttempts = results.length
  const passedCount = results.filter((r) => r.passed).length
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
      : 0
  const totalTime = results.reduce((acc, r) => acc + r.durationSeconds, 0)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Page header */}
        <section className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-foreground text-balance">
            My Results
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Track every practice attempt, score trend, and study duration in one clean view.
          </p>
        </section>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-24 text-center shadow-sm">
            <BookOpen className="size-10 text-muted-foreground/40 mb-4" aria-hidden="true" />
            <p className="text-lg font-medium text-foreground">No results yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your first exam to see your results here.
            </p>
            <Button render={<Link href="/" />} nativeButton={false} className="mt-6">
              Browse Exams
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total Attempts', value: totalAttempts },
                { label: 'Passed', value: passedCount },
                { label: 'Avg. Score', value: `${avgScore}%` },
                { label: 'Total Study Time', value: formatDuration(totalTime) },
              ].map(({ label, value }) => (
                <Card key={label} className="border-border shadow-sm">
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xl font-black text-primary">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Results list */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                History
              </h2>

              {results.map((result) => {
                const { label, color } = scoreBand(result.score)
                return (
                  <Card key={result.id} className="border-border shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/10">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Left: title + badges */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <SkillBadge skill={result.examSkill} />
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                result.mode === 'real-test'
                                  ? 'border-brand-orange/30 bg-brand-orange-light text-brand-orange'
                                  : 'border-primary/30 bg-secondary text-primary'
                              )}
                            >
                              {result.mode === 'real-test' ? 'Real Test' : 'Practice'}
                            </Badge>
                            {result.passed ? (
                              <Badge
                                variant="outline"
                                className="border-primary/30 bg-secondary text-primary text-xs"
                              >
                                <CheckCircle2 className="size-3 mr-1" aria-hidden="true" />
                                Passed
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-red-300 bg-red-50 text-red-700 text-xs"
                              >
                                <XCircle className="size-3 mr-1" aria-hidden="true" />
                                Failed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {result.examTitle}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" aria-hidden="true" />
                            {formatDate(result.completedAt)} &middot; {formatDuration(result.durationSeconds)}
                          </p>
                        </div>

                        {/* Right: score */}
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                          <div className="flex items-baseline gap-1">
                            <span className={cn('text-2xl font-bold', color)}>
                              {result.score}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {result.correctCount}/{result.totalCount} correct
                          </p>
                          <div className="w-24 hidden sm:block">
                            <Progress value={result.score} className="h-1.5" aria-label={`Score: ${result.score}%`} />
                          </div>
                        </div>
                      </div>

                      {/* Mobile progress */}
                      <div className="mt-3 sm:hidden">
                        <Progress value={result.score} className="h-1.5" aria-label={`Score: ${result.score}%`} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-center pt-4">
              <Button render={<Link href="/" />} nativeButton={false} variant="outline">
                <BookOpen data-icon="inline-start" />
                Browse More Exams
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
