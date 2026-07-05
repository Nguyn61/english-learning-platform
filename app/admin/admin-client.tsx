'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  Eye, EyeOff, HelpCircle, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { ExamForm } from './exam-form'
import { QuestionForm } from './question-form'
import { createExam, updateExam, deleteExam, createQuestion, deleteQuestion } from '@/lib/data-service'
import type { Exam, Question, ExamFormData, QuestionFormData } from '@/lib/types'

interface AdminClientProps {
  initialExams: Exam[]
  initialQuestions: Record<string, Question[]>
}

export function AdminClient({ initialExams, initialQuestions }: AdminClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [questions, setQuestions] = useState<Record<string, Question[]>>(initialQuestions)
  const [expandedExam, setExpandedExam] = useState<string | null>(null)

  // Dialog state
  const [examFormOpen, setExamFormOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [questionFormExamId, setQuestionFormExamId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'exam' | 'question'; examId: string; questionId?: string; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleCreateExam(data: ExamFormData) {
    const exam = await createExam(data)
    setExams((prev) => [...prev, exam])
    startTransition(() => router.refresh())
  }

  async function handleEditExam(data: ExamFormData) {
    if (!editingExam) return
    const updated = await updateExam(editingExam.id, data)
    if (updated) setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    startTransition(() => router.refresh())
  }

  async function handleDeleteExam() {
    if (!deleteConfirm || deleteConfirm.type !== 'exam') return
    setDeleting(true)
    await deleteExam(deleteConfirm.examId)
    setExams((prev) => prev.filter((e) => e.id !== deleteConfirm.examId))
    setDeleteConfirm(null)
    setDeleting(false)
  }

  async function handleAddQuestion(examId: string, data: QuestionFormData) {
    const qs = questions[examId] ?? []
    const q = await createQuestion({ ...data, examId, order: qs.length + 1 })
    setQuestions((prev) => ({ ...prev, [examId]: [...(prev[examId] ?? []), q] }))
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, questionCount: (questions[examId]?.length ?? 0) + 1 } : e))
    )
    startTransition(() => router.refresh())
  }

  async function handleDeleteQuestion() {
    if (!deleteConfirm || deleteConfirm.type !== 'question' || !deleteConfirm.questionId) return
    setDeleting(true)
    await deleteQuestion(deleteConfirm.examId, deleteConfirm.questionId)
    setQuestions((prev) => ({
      ...prev,
      [deleteConfirm.examId]: (prev[deleteConfirm.examId] ?? []).filter(
        (q) => q.id !== deleteConfirm.questionId
      ),
    }))
    setExams((prev) =>
      prev.map((e) =>
        e.id === deleteConfirm.examId
          ? { ...e, questionCount: Math.max(0, e.questionCount - 1) }
          : e
      )
    )
    setDeleteConfirm(null)
    setDeleting(false)
  }

  const questionFormExam = exams.find((e) => e.id === questionFormExamId) ?? null

  return (
    <>
      {/* Exam Create/Edit dialog */}
      <ExamForm
        open={examFormOpen}
        onClose={() => { setExamFormOpen(false); setEditingExam(null) }}
        onSave={editingExam ? handleEditExam : handleCreateExam}
        initial={editingExam}
      />

      {/* Question add dialog */}
      {questionFormExamId && questionFormExam && (
        <QuestionForm
          open
          onClose={() => setQuestionFormExamId(null)}
          onSave={(data) => handleAddQuestion(questionFormExamId, data)}
          examSkill={questionFormExam.skill}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteConfirm?.type === 'exam' ? 'Exam' : 'Question'}?
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium">&ldquo;{deleteConfirm?.label}&rdquo;</span> will be permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteConfirm?.type === 'exam' ? handleDeleteExam : handleDeleteQuestion}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main table */}
      <div className="space-y-3">
        {exams.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">No exams yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click &ldquo;New Exam&rdquo; to get started.</p>
          </div>
        )}

        {exams.map((exam) => {
          const qs = questions[exam.id] ?? []
          const isExpanded = expandedExam === exam.id

          return (
            <div key={exam.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/10">
              {/* Exam row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <button
                  type="button"
                  onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
                  className="flex min-h-12 flex-1 items-center gap-2 rounded-md text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-expanded={isExpanded}
                  aria-controls={`questions-${exam.id}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <SkillBadge skill={exam.skill} />
                      <DifficultyBadge difficulty={exam.difficulty} />
                      <Badge
                        variant="outline"
                        className={exam.published
                          ? 'border-green-300 bg-green-50 text-green-700 text-xs'
                          : 'border-amber-300 bg-amber-50 text-amber-700 text-xs'}
                      >
                        {exam.published ? (
                          <><Eye className="size-3 mr-1" aria-hidden="true" />Published</>
                        ) : (
                          <><EyeOff className="size-3 mr-1" aria-hidden="true" />Draft</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug truncate">{exam.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="size-3" aria-hidden="true" />
                        {exam.questionCount} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" aria-hidden="true" />
                        {exam.timeLimitMinutes} min
                      </span>
                    </div>
                  </div>
                </button>

                {/* Exam actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setQuestionFormExamId(exam.id); setExpandedExam(exam.id) }}
                    aria-label="Add question"
                    title="Add question"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline ml-1 text-xs">Add Q</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditingExam(exam); setExamFormOpen(true) }}
                    aria-label="Edit exam"
                    title="Edit exam"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setDeleteConfirm({ type: 'exam', examId: exam.id, label: exam.title })
                    }
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete exam"
                    title="Delete exam"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Questions list */}
              {isExpanded && (
                <div id={`questions-${exam.id}`}>
                  <Separator />
                  <div className="px-4 pb-3 pt-2 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Questions ({qs.length})
                    </p>
                    {qs.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No questions yet. Click &ldquo;Add Q&rdquo; to add the first one.
                      </p>
                    ) : (
                      qs.map((q, idx) => (
                        <div
                          key={q.id}
                          className="flex items-start gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <p className="flex-1 min-w-0 text-sm text-foreground line-clamp-2 leading-snug">
                            {q.text}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <DifficultyBadge difficulty={q.difficulty} />
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'question',
                                  examId: exam.id,
                                  questionId: q.id,
                                  label: q.text.slice(0, 60),
                                })
                              }
                              className="ml-1 flex size-11 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
                              aria-label="Delete question"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1 w-full border border-dashed border-primary/30 bg-secondary/60 text-xs text-primary hover:bg-secondary"
                      onClick={() => setQuestionFormExamId(exam.id)}
                    >
                      <Plus data-icon="inline-start" />
                      Add Question
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FAB */}
      <div className="mt-6 flex justify-end">
        <Button onClick={() => { setEditingExam(null); setExamFormOpen(true) }}>
          <Plus data-icon="inline-start" />
          New Exam
        </Button>
      </div>
    </>
  )
}
