import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpenCheck, Clock, GraduationCap, History, Sparkles, TrendingUp } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ExamCard } from '@/components/exam-card'
import { ExamFilters } from '@/components/exam-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getExams } from '@/lib/data-service'
import type { Skill, Difficulty } from '@/lib/types'

interface HomeProps {
  searchParams: Promise<{ skill?: string; difficulty?: string; q?: string }>
}

async function ExamGrid({ searchParams }: HomeProps) {
  const { skill, difficulty, q } = await searchParams
  const exams = await getExams()

  const filtered = exams.filter((exam) => {
    if (skill && skill !== 'all' && exam.skill !== (skill as Skill)) return false
    if (difficulty && difficulty !== 'all' && exam.difficulty !== (difficulty as Difficulty)) return false
    if (q) {
      const query = q.toLowerCase()
      if (
        !exam.title.toLowerCase().includes(query) &&
        !exam.description.toLowerCase().includes(query)
      ) {
        return false
      }
    }
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-20 text-center shadow-sm">
        <BookOpenCheck className="mb-3 size-10 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-lg font-extrabold text-foreground">No exams found</p>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Try another skill, level, or search keyword.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((exam) => (
        <ExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  )
}

function ExamGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  )
}

export default async function HomePage({ searchParams }: HomeProps) {
  const exams = await getExams()
  const totalQuestions = exams.reduce((sum, exam) => sum + exam.questionCount, 0)
  const totalAttempts = exams.reduce((sum, exam) => sum + exam.attempts, 0)
  const publishedExams = exams.filter((exam) => exam.published).length

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content" className="pb-10">
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-7 sm:px-6 sm:py-9 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-3 border-primary/25 bg-secondary text-primary">
                TOEIC practice hub
              </Badge>
              <h1 className="max-w-2xl text-3xl font-black tracking-tight text-foreground text-balance sm:text-4xl">
                Train with focused English exams, timed practice, and instant review.
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                Choose a skill, start a short practice set, and review each answer while the context
                is still fresh. Teachers can keep the catalog organized from the admin workspace.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button render={<Link href="#catalog" />} nativeButton={false} size="lg">
                  <Sparkles data-icon="inline-start" />
                  Browse practice
                </Button>
                <Button render={<Link href="/results" />} nativeButton={false} variant="outline" size="lg">
                  <History data-icon="inline-start" />
                  View results
                </Button>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-2 sm:max-w-xl">
                {[
                  { icon: GraduationCap, label: 'Published', value: publishedExams },
                  { icon: BookOpenCheck, label: 'Questions', value: totalQuestions },
                  { icon: TrendingUp, label: 'Attempts', value: totalAttempts.toLocaleString('en-US') },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg border border-border bg-muted/45 p-3">
                    <Icon className="mb-2 size-4 text-primary" aria-hidden="true" />
                    <dt className="text-[11px] font-bold uppercase text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-lg font-black text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-brand-orange" aria-hidden="true" />
                  Timed exam workspace
                </span>
                <span className="hidden text-primary sm:inline">Practice + review</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-background p-2 shadow-sm">
                <Image
                  src="/screenshot-exam-taking.png"
                  alt="YouPass English timed exam screen showing question navigation, progress, and answer choices."
                  width={1280}
                  height={577}
                  priority
                  className="h-auto w-full rounded-md border border-border"
                  sizes="(min-width: 1024px) 520px, 100vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="catalog" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground">Practice catalog</h2>
              <p className="mt-1 text-sm text-muted-foreground">Filter by skill, level, or exam title.</p>
            </div>
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground shadow-sm">
              <Clock className="size-3.5 text-brand-orange" aria-hidden="true" />
              Timed and scored
            </div>
          </div>

          <div className="mb-6">
            <Suspense fallback={<Skeleton className="h-44 w-full rounded-lg" />}>
              <ExamFilters />
            </Suspense>
          </div>

          <Suspense fallback={<ExamGridSkeleton />}>
            <ExamGrid searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
    </div>
  )
}
