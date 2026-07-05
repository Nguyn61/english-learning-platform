'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { QuestionFormData, Skill, Difficulty } from '@/lib/types'

interface QuestionFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: QuestionFormData) => Promise<void>
  examSkill: Skill
}

function makeAnswerId(index: number) {
  return String.fromCharCode(97 + index) // a, b, c, d...
}

const DEFAULT_ANSWERS = [
  { id: 'a', text: '' },
  { id: 'b', text: '' },
  { id: 'c', text: '' },
  { id: 'd', text: '' },
]

export function QuestionForm({ open, onClose, onSave, examSkill }: QuestionFormProps) {
  const [text, setText] = useState('')
  const [passage, setPassage] = useState('')
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS.map((a) => ({ ...a })))
  const [correctAnswerId, setCorrectAnswerId] = useState('a')
  const [explanation, setExplanation] = useState('')
  const [skill, setSkill] = useState<Skill>(examSkill)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!text.trim()) e.text = 'Question text is required'
    if (answers.some((a) => !a.text.trim())) e.answers = 'All answer choices must be filled in'
    if (!explanation.trim()) e.explanation = 'Explanation is required'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave({ text, passage: passage.trim() || undefined, answers, correctAnswerId, explanation, skill, difficulty })
      // Reset form
      setText(''); setPassage(''); setAnswers(DEFAULT_ANSWERS.map((a) => ({ ...a })))
      setCorrectAnswerId('a'); setExplanation(''); setErrors({})
      onClose()
    } finally {
      setSaving(false)
    }
  }

  function updateAnswer(idx: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? { ...a, text: value } : a)))
    setErrors((prev) => ({ ...prev, answers: undefined! }))
  }

  function addAnswer() {
    if (answers.length >= 6) return
    setAnswers((prev) => [...prev, { id: makeAnswerId(prev.length), text: '' }])
  }

  function removeAnswer(idx: number) {
    if (answers.length <= 2) return
    const removed = answers[idx].id
    setAnswers((prev) => prev.filter((_, i) => i !== idx))
    if (correctAnswerId === removed) setCorrectAnswerId(answers[0].id)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Fill in the question text, answer choices, and explanation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Passage (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="qf-passage">
              Passage <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="qf-passage"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              placeholder="Paste a reading passage, email, or dialogue here..."
              rows={4}
              className="font-mono text-xs"
            />
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <Label htmlFor="qf-text">Question Text</Label>
            <Textarea
              id="qf-text"
              value={text}
              onChange={(e) => { setText(e.target.value); setErrors((p) => ({ ...p, text: undefined! })) }}
              placeholder="e.g. The report ______ before the deadline."
              rows={2}
              aria-invalid={!!errors.text}
            />
            {errors.text && <p className="text-xs text-destructive">{errors.text}</p>}
          </div>

          {/* Answers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Answer Choices</Label>
              <span className="text-xs text-muted-foreground">Click a row to mark correct</span>
            </div>
            {errors.answers && <p className="text-xs text-destructive">{errors.answers}</p>}
            <div className="space-y-2">
              {answers.map((answer, idx) => (
                <div
                  key={answer.id}
                  className={cn(
                    'flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    correctAnswerId === answer.id
                      ? 'border-primary bg-accent'
                      : 'border-border bg-card hover:border-primary/30'
                  )}
                  onClick={() => setCorrectAnswerId(answer.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setCorrectAnswerId(answer.id)
                    }
                  }}
                  aria-pressed={correctAnswerId === answer.id}
                  aria-label={`Answer ${answer.id.toUpperCase()}${correctAnswerId === answer.id ? ' (correct)' : ''}`}
                >
                  <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                    {answer.id.toUpperCase()}
                  </span>
                  <Input
                    value={answer.text}
                    onChange={(e) => { e.stopPropagation(); updateAnswer(idx, e.target.value) }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={`Answer ${answer.id.toUpperCase()}`}
                    className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
                  />
                  {correctAnswerId === answer.id && (
                    <span className="text-[10px] font-semibold text-primary shrink-0">CORRECT</span>
                  )}
                  {answers.length > 2 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeAnswer(idx) }}
                      className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
                      aria-label="Remove answer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {answers.length < 6 && (
              <Button type="button" variant="ghost" size="sm" onClick={addAnswer} className="w-full border border-dashed border-border">
                <Plus data-icon="inline-start" />
                Add Answer Choice
              </Button>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <Label htmlFor="qf-explanation">Explanation</Label>
            <Textarea
              id="qf-explanation"
              value={explanation}
              onChange={(e) => { setExplanation(e.target.value); setErrors((p) => ({ ...p, explanation: undefined! })) }}
              placeholder="Explain why the correct answer is right..."
              rows={3}
              aria-invalid={!!errors.explanation}
            />
            {errors.explanation && <p className="text-xs text-destructive">{errors.explanation}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Skill</Label>
              <Select value={skill} onValueChange={(v) => setSkill(v as Skill)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['reading', 'listening', 'grammar', 'vocabulary', 'writing', 'speaking'] as Skill[]).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Add Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
