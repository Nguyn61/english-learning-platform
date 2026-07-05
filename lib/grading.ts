import type { Question, UserAnswer, ExamResult, ExamMode } from './types'
import type { Exam } from './types'

/**
 * Grade a completed exam and return a full ExamResult.
 * Pure function — no side effects, easy to test.
 */
export function gradeExam({
  exam,
  questions,
  userAnswers,
  mode,
  startedAt,
}: {
  exam: Exam
  questions: Question[]
  userAnswers: Record<string, string | null> // questionId -> selectedAnswerId
  mode: ExamMode
  startedAt: Date
}): Omit<ExamResult, 'id'> {
  const completedAt = new Date()
  const durationSeconds = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)

  const gradedAnswers: UserAnswer[] = questions.map((q) => {
    const selected = userAnswers[q.id] ?? null
    return {
      questionId: q.id,
      selectedAnswerId: selected,
      isCorrect: selected === q.correctAnswerId,
    }
  })

  const correctCount = gradedAnswers.filter((a) => a.isCorrect).length
  const totalCount = questions.length
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  return {
    examId: exam.id,
    examTitle: exam.title,
    examSkill: exam.skill,
    mode,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationSeconds,
    score,
    correctCount,
    totalCount,
    userAnswers: gradedAnswers,
    passed: score >= 60,
  }
}

/** Format seconds as mm:ss */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Format a score into a readable band label */
export function scoreBand(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent', color: 'text-success' }
  if (score >= 75) return { label: 'Good', color: 'text-primary' }
  if (score >= 60) return { label: 'Pass', color: 'text-warning' }
  return { label: 'Needs Work', color: 'text-destructive' }
}
