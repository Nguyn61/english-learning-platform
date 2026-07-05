'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, ChevronRight, Flag, Clock, CheckCircle2,
  AlertCircle, BookOpen, RotateCcw, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SkillBadge } from '@/components/skill-badge'
import { DifficultyBadge } from '@/components/difficulty-badge'
import { useExamTimer } from '@/hooks/use-exam-timer'
import { gradeExam, formatDuration, scoreBand } from '@/lib/grading'
import { saveResult } from '@/lib/data-service'
import { cn } from '@/lib/utils'
import type { Exam, Question, ExamResult, ExamMode } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ExamPhase = 'setup' | 'taking' | 'result'

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({
  exam,
  initialMode,
  onStart,
}: {
  exam: Exam
  initialMode: ExamMode
  onStart: (mode: ExamMode) => void
}) {
  const [mode, setMode] = useState<ExamMode>(initialMode)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl space-y-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2 mb-3">
            <SkillBadge skill={exam.skill} />
            <DifficultyBadge difficulty={exam.difficulty} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-balance text-foreground">
            {exam.title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{exam.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-muted/50">
          <div className="flex flex-col items-center py-4 px-3 text-center">
            <span className="text-xl font-black text-primary">{exam.questionCount}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Questions</span>
          </div>
          <div className="flex flex-col items-center py-4 px-3 text-center">
            <span className="text-xl font-black text-primary">{exam.timeLimitMinutes}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Minutes</span>
          </div>
          <div className="flex flex-col items-center py-4 px-3 text-center">
            <span className="text-xl font-black text-primary">60%</span>
            <span className="text-xs text-muted-foreground mt-0.5">Pass Score</span>
          </div>
        </div>

        {/* Mode selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Choose your mode</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('practice')}
              className={cn(
                'min-h-28 rounded-lg border p-4 text-left outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50',
                mode === 'practice'
                  ? 'border-primary bg-secondary shadow-sm shadow-primary/10'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/60'
              )}
              aria-pressed={mode === 'practice'}
            >
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="size-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">Practice</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                See explanations after each question. Great for learning.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('real-test')}
              className={cn(
                'min-h-28 rounded-lg border p-4 text-left outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50',
                mode === 'real-test'
                  ? 'border-brand-orange bg-brand-orange-light shadow-sm shadow-brand-orange/10'
                  : 'border-border bg-card hover:border-brand-orange/40 hover:bg-brand-orange-light/60'
              )}
              aria-pressed={mode === 'real-test'}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="size-4 text-brand-orange" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">Real Test</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Timed, no hints. Review only after submitting.
              </p>
            </button>
          </div>
        </div>

        <Button onClick={() => onStart(mode)} className="w-full" size="lg">
          Start practice
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}

// ─── Timer Display ────────────────────────────────────────────────────────────

function TimerDisplay({
  formatted,
  isWarning,
  isCritical,
  percentLeft,
}: {
  formatted: string
  isWarning: boolean
  isCritical: boolean
  percentLeft: number
}) {
  return (
    <div className="flex flex-col items-end gap-1 min-w-[80px]">
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-sm font-semibold tabular-nums',
          isCritical
            ? 'bg-destructive/10 text-destructive'
            : isWarning
            ? 'bg-brand-orange-light text-brand-orange'
            : 'bg-secondary text-primary'
        )}
        aria-live="polite"
        aria-label={`Time remaining: ${formatted}`}
      >
        <Clock className="size-3.5" aria-hidden="true" />
        {formatted}
      </div>
      <Progress
        value={percentLeft}
        className={cn(
          'h-1 w-20',
          isCritical ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-brand-orange' : '[&>div]:bg-primary'
        )}
        aria-hidden="true"
      />
    </div>
  )
}

// ─── Question Navigation Grid ─────────────────────────────────────────────────

type QuestionStatus = 'unanswered' | 'answered' | 'current' | 'flagged' | 'skipped'

function getQuestionStatus(
  index: number,
  currentIndex: number,
  userAnswers: Record<string, string | null>,
  flagged: Set<number>,
  questions: Question[]
): QuestionStatus {
  if (index === currentIndex) return 'current'
  const q = questions[index]
  if (!q) return 'unanswered'
  if (flagged.has(index)) return 'flagged'
  const ans = userAnswers[q.id]
  if (ans !== undefined && ans !== null) return 'answered'
  return 'unanswered'
}

const STATUS_CLASSES: Record<QuestionStatus, string> = {
  current: 'bg-primary text-primary-foreground font-bold ring-2 ring-primary ring-offset-1',
  answered: 'bg-primary/15 text-primary border-primary/30 font-medium',
  flagged: 'bg-brand-orange-light text-brand-orange border-brand-orange/40 font-medium',
  skipped: 'bg-muted text-muted-foreground border-border',
  unanswered: 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
}

function QuestionNavGrid({
  questions,
  currentIndex,
  userAnswers,
  flagged,
  onJump,
}: {
  questions: Question[]
  currentIndex: number
  userAnswers: Record<string, string | null>
  flagged: Set<number>
  onJump: (index: number) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Questions</p>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((_, i) => {
          const status = getQuestionStatus(i, currentIndex, userAnswers, flagged, questions)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              className={cn(
                'flex size-11 items-center justify-center rounded border text-xs outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50',
                STATUS_CLASSES[status]
              )}
              aria-label={`Question ${i + 1}, ${status}`}
              aria-current={status === 'current' ? 'true' : undefined}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
        {(
          [
            ['answered', 'Answered'],
            ['unanswered', 'Not answered'],
            ['flagged', 'Flagged'],
            ['current', 'Current'],
          ] as [QuestionStatus, string][]
        ).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className={cn(
                'flex size-3.5 shrink-0 items-center justify-center rounded-sm border text-[8px]',
                STATUS_CLASSES[status]
              )}
              aria-hidden="true"
            />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Question Display ─────────────────────────────────────────────────────────

function QuestionDisplay({
  question,
  selectedAnswerId,
  onSelect,
  showExplanation,
  revealed,
}: {
  question: Question
  selectedAnswerId: string | null
  onSelect: (answerId: string) => void
  showExplanation: boolean
  revealed: boolean
}) {
  const isCorrect = selectedAnswerId === question.correctAnswerId

  return (
    <div className="space-y-4">
      {/* Passage */}
      {question.passage && (
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Read the following passage
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {question.passage}
          </pre>
        </div>
      )}

      {/* Question text */}
      <p className="text-base font-medium leading-relaxed text-foreground">{question.text}</p>

      {/* Answers */}
      <div className="space-y-2" role="radiogroup" aria-label="Answer choices">
        {question.answers.map((answer) => {
          const isSelected = selectedAnswerId === answer.id
          const isCorrectAnswer = answer.id === question.correctAnswerId
          let answerClass = 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50'

          if (revealed) {
            if (isCorrectAnswer) {
              answerClass = 'border-green-400 bg-green-50 text-green-800'
            } else if (isSelected && !isCorrectAnswer) {
              answerClass = 'border-red-400 bg-red-50 text-red-800'
            } else {
              answerClass = 'border-border bg-card text-muted-foreground'
            }
          } else if (isSelected) {
            answerClass = 'border-primary bg-secondary text-primary'
          }

          return (
            <button
              key={answer.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => !revealed && onSelect(answer.id)}
              className={cn(
                'min-h-12 w-full rounded-lg border px-4 py-3 text-left text-sm leading-relaxed outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50',
                answerClass,
                revealed ? 'cursor-default' : 'cursor-pointer'
              )}
              aria-disabled={revealed}
            >
              <span className="font-semibold mr-2 text-muted-foreground">
                {answer.id.toUpperCase()}.
              </span>
              {answer.text}
            </button>
          )
        })}
      </div>

      {/* Practice mode feedback */}
      {revealed && showExplanation && (
        <div
          className={cn(
            'rounded-lg border p-4 text-sm',
            isCorrect
              ? 'border-green-300 bg-green-50 text-green-900'
              : 'border-red-300 bg-red-50 text-red-900'
          )}
        >
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            )}
            <div>
              <p className="font-semibold mb-1">
                {isCorrect ? 'Correct!' : `Incorrect — correct answer: ${question.correctAnswerId.toUpperCase()}`}
              </p>
              <p className="leading-relaxed opacity-80">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultScreen({
  result,
  questions,
  onReview,
  onRetry,
  onHome,
}: {
  result: ExamResult
  questions: Question[]
  onReview: () => void
  onRetry: () => void
  onHome: () => void
}) {
  const { label, color } = scoreBand(result.score)
  const answeredCount = result.userAnswers.filter((a) => a.selectedAnswerId !== null).length

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        {/* Score card */}
        <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <div
            className={cn(
              'mx-auto mb-3 flex size-20 items-center justify-center rounded-full text-3xl font-bold',
              result.passed
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            )}
            aria-label={`Score: ${result.score}%`}
          >
            {result.score}%
          </div>
          <p className={cn('text-lg font-bold mb-1', color)}>{label}</p>
          <p className="text-sm text-muted-foreground">
            {result.passed ? 'You passed! Great work.' : 'Keep practicing — you can do it.'}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Correct', value: `${result.correctCount}/${result.totalCount}` },
            { label: 'Answered', value: `${answeredCount}/${result.totalCount}` },
            { label: 'Duration', value: formatDuration(result.durationSeconds) },
            { label: 'Mode', value: result.mode === 'practice' ? 'Practice' : 'Real Test' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-base font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Score</span>
            <span>{result.score}% / 60% pass</span>
          </div>
          <Progress value={result.score} className="h-2.5" />
          {/* Pass marker */}
          <div className="relative h-3">
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: '60%' }}
              aria-hidden="true"
            >
              <div className="h-2 w-px bg-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">Pass (60%)</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onReview} variant="outline" className="flex-1">
            Review Answers
          </Button>
          <Button onClick={onRetry} variant="outline" className="flex-1">
            <RotateCcw data-icon="inline-start" />
            Retry
          </Button>
          <Button onClick={onHome} className="flex-1">
            All Exams
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Review Screen ────────────────────────────────────────────────────────────

function ReviewScreen({
  questions,
  result,
  onBack,
}: {
  questions: Question[]
  result: ExamResult
  onBack: () => void
}) {
  const answerMap = new Map(result.userAnswers.map((a) => [a.questionId, a]))

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft data-icon="inline-start" />
            Back to Results
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Answer Review</h2>
        </div>

        <div className="space-y-8">
          {questions.map((q, idx) => {
            const ua = answerMap.get(q.id)
            const isCorrect = ua?.isCorrect ?? false
            const selected = ua?.selectedAnswerId ?? null

            return (
              <div key={q.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}
                    aria-label={isCorrect ? 'Correct' : 'Incorrect'}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <QuestionDisplay
                      question={q}
                      selectedAnswerId={selected}
                      onSelect={() => {}}
                      showExplanation
                      revealed
                    />
                  </div>
                </div>
                {idx < questions.length - 1 && <Separator />}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={onBack} variant="outline">
            <ChevronLeft data-icon="inline-start" />
            Back to Results
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Exam Client ─────────────────────────────────────────────────────────

interface ExamClientProps {
  exam: Exam
  questions: Question[]
  initialMode?: ExamMode
}

export function ExamClient({ exam, questions, initialMode = 'practice' }: ExamClientProps) {
  const router = useRouter()

  const [phase, setPhase] = useState<ExamPhase>('setup')
  const [mode, setMode] = useState<ExamMode>(initialMode)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [revealedQuestions, setRevealedQuestions] = useState<Set<string>>(new Set())
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [showReview, setShowReview] = useState(false)

  const startedAtRef = useRef<Date>(new Date())

  // Timer
  const timer = useExamTimer({
    totalSeconds: exam.timeLimitMinutes * 60,
    onExpire: handleSubmit,
    autoStart: false,
  })

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.values(userAnswers).filter((v) => v !== null).length
  const unansweredCount = questions.length - answeredCount

  function handleStart(selectedMode: ExamMode) {
    setMode(selectedMode)
    setPhase('taking')
    startedAtRef.current = new Date()
    timer.start()
  }

  function handleSelectAnswer(answerId: string) {
    if (!currentQuestion) return
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: answerId }))

    // In practice mode, reveal feedback immediately
    if (mode === 'practice') {
      setRevealedQuestions((prev) => new Set(prev).add(currentQuestion.id))
    }
  }

  function handleToggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(currentIndex)) next.delete(currentIndex)
      else next.add(currentIndex)
      return next
    })
  }

  async function handleSubmit() {
    timer.stop()
    setShowSubmitDialog(false)

    const graded = gradeExam({
      exam,
      questions,
      userAnswers,
      mode,
      startedAt: startedAtRef.current,
    })

    const saved = await saveResult(graded)
    setResult(saved)
    setPhase('result')
  }

  function handleRetry() {
    setPhase('setup')
    setCurrentIndex(0)
    setUserAnswers({})
    setFlagged(new Set())
    setRevealedQuestions(new Set())
    setResult(null)
    setShowReview(false)
    timer.reset()
  }

  // ── Setup phase ──
  if (phase === 'setup') {
    return <SetupScreen exam={exam} initialMode={mode} onStart={handleStart} />
  }

  // ── Result phase ──
  if (phase === 'result' && result) {
    if (showReview) {
      return (
        <ReviewScreen
          questions={questions}
          result={result}
          onBack={() => setShowReview(false)}
        />
      )
    }
    return (
      <ResultScreen
        result={result}
        questions={questions}
        onReview={() => setShowReview(true)}
        onRetry={handleRetry}
        onHome={() => router.push('/')}
      />
    )
  }

  // ── Taking phase ──
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No questions found for this exam.</p>
      </div>
    )
  }

  const isRevealed = revealedQuestions.has(currentQuestion.id)
  const selectedAnswer = userAnswers[currentQuestion.id] ?? null
  const canGoNext = currentIndex < questions.length - 1
  const canGoPrev = currentIndex > 0
  const isFlagged = flagged.has(currentIndex)

  return (
    <>
      {/* Confirm submit dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              {unansweredCount > 0 ? (
                <>
                  You have <strong>{unansweredCount}</strong> unanswered{' '}
                  {unansweredCount === 1 ? 'question' : 'questions'}. You cannot change your
                  answers after submitting.
                </>
              ) : (
                'You have answered all questions. Submit now?'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Exam
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-[calc(100vh-4rem)] bg-background">
        {/* Sidebar */}
        <aside className="hidden shrink-0 flex-col gap-5 border-r border-border bg-card p-4 shadow-sm lg:flex lg:w-64 xl:w-72">
          {/* Exam info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Exam</p>
            <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
              {exam.title}
            </p>
            <div className="flex gap-1.5 mt-2">
              <SkillBadge skill={exam.skill} />
              <Badge variant="secondary" className="text-xs capitalize">
                {mode}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{answeredCount}/{questions.length}</span>
            </div>
            <Progress value={(answeredCount / questions.length) * 100} className="h-1.5" />
          </div>

          <Separator />

          {/* Question nav */}
          <QuestionNavGrid
            questions={questions}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            flagged={flagged}
            onJump={setCurrentIndex}
          />

          <div className="mt-auto">
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="w-full"
              variant="outline"
              size="sm"
            >
              Submit Exam
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Exam top bar */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium text-muted-foreground shrink-0">
                Q {currentIndex + 1} of {questions.length}
              </span>
              <Progress
                value={((currentIndex + 1) / questions.length) * 100}
                className="h-1.5 w-24 hidden sm:block"
                aria-hidden="true"
              />
            </div>

            <div className="flex items-center gap-2">
              <TimerDisplay
                formatted={timer.formatted}
                isWarning={timer.isWarning}
                isCritical={timer.isCritical}
                percentLeft={timer.percentLeft}
              />
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:flex"
                onClick={() => setShowSubmitDialog(true)}
              >
                Submit
              </Button>
            </div>
          </div>

          {/* Question body */}
          <div className="flex-1 overflow-auto">
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
              {/* Question header */}
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Question {currentIndex + 1}
                  </span>
                  <SkillBadge skill={currentQuestion.skill} />
                  <DifficultyBadge difficulty={currentQuestion.difficulty} />
                </div>
                <button
                  type="button"
                  onClick={handleToggleFlag}
                  className={cn(
                    'flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-xs font-bold outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50',
                    isFlagged
                      ? 'border border-brand-orange/40 bg-brand-orange-light text-brand-orange'
                      : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                  )}
                  aria-pressed={isFlagged}
                  aria-label={isFlagged ? 'Remove flag' : 'Flag this question'}
                >
                  <Flag className="size-3.5" aria-hidden="true" />
                  {isFlagged ? 'Flagged' : 'Flag'}
                </button>
              </div>

              {/* Question */}
              <QuestionDisplay
                question={currentQuestion}
                selectedAnswerId={selectedAnswer}
                onSelect={handleSelectAnswer}
                showExplanation={mode === 'practice'}
                revealed={isRevealed}
              />
            </div>
          </div>

          {/* Navigation footer */}
          <div className="border-t border-border bg-card px-4 py-3">
            <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={!canGoPrev}
              >
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>

              {/* Mobile question nav */}
              <div className="flex max-w-[42vw] items-center gap-1 overflow-x-auto lg:hidden sm:max-w-xs">
                {questions.map((_, i) => {
                  const status = getQuestionStatus(i, currentIndex, userAnswers, flagged, questions)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded border text-[11px] outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50',
                        STATUS_CLASSES[status]
                      )}
                      aria-label={`Question ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>

              {canGoNext ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  Next
                  <ChevronRight data-icon="inline-end" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
