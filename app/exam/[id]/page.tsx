import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { ExamClient } from './exam-client'
import { getExamById, getQuestionsByExamId } from '@/lib/data-service'
import type { ExamMode } from '@/lib/types'

interface ExamPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}

export async function generateMetadata({ params }: ExamPageProps) {
  const { id } = await params
  const exam = await getExamById(id)
  if (!exam) return {}
  return {
    title: `${exam.title} — YouPass English`,
    description: exam.description,
  }
}

export default async function ExamPage({ params, searchParams }: ExamPageProps) {
  const { id } = await params
  const { mode } = await searchParams
  const [exam, questions] = await Promise.all([getExamById(id), getQuestionsByExamId(id)])

  if (!exam || !exam.published) notFound()

  const initialMode: ExamMode = mode === 'real-test' ? 'real-test' : 'practice'

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content">
        <ExamClient exam={exam} questions={questions} initialMode={initialMode} />
      </main>
    </div>
  )
}
