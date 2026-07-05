'use client'

import { useState } from 'react'
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
import type { Exam, ExamFormData, Skill, Difficulty } from '@/lib/types'

interface ExamFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: ExamFormData) => Promise<void>
  initial?: Exam | null
}

const DEFAULT: ExamFormData = {
  title: '',
  description: '',
  skill: 'grammar',
  difficulty: 'easy',
  timeLimitMinutes: 20,
  published: false,
}

export function ExamForm({ open, onClose, onSave, initial }: ExamFormProps) {
  const [form, setForm] = useState<ExamFormData>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          skill: initial.skill,
          difficulty: initial.difficulty,
          timeLimitMinutes: initial.timeLimitMinutes,
          published: initial.published,
        }
      : DEFAULT
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ExamFormData, string>>>({})

  function validate() {
    const e: typeof errors = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (form.timeLimitMinutes < 1) e.timeLimitMinutes = 'Must be at least 1 minute'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  function set<K extends keyof ExamFormData>(key: K, value: ExamFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Exam' : 'New Exam'}</DialogTitle>
          <DialogDescription>
            {initial ? 'Update the exam details below.' : 'Fill in the details to create a new exam.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ef-title">Title</Label>
            <Input
              id="ef-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. TOEIC Part 5 — Grammar"
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ef-desc">Description</Label>
            <Textarea
              id="ef-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Briefly describe what this exam covers..."
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ef-skill">Skill</Label>
              <Select value={form.skill} onValueChange={(v) => set('skill', v as Skill)}>
                <SelectTrigger id="ef-skill">
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
              <Label htmlFor="ef-difficulty">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v as Difficulty)}>
                <SelectTrigger id="ef-difficulty">
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

          <div className="space-y-1.5">
            <Label htmlFor="ef-time">Time Limit (minutes)</Label>
            <Input
              id="ef-time"
              type="number"
              min={1}
              max={180}
              value={form.timeLimitMinutes}
              onChange={(e) => set('timeLimitMinutes', Number(e.target.value))}
              aria-invalid={!!errors.timeLimitMinutes}
            />
            {errors.timeLimitMinutes && (
              <p className="text-xs text-destructive">{errors.timeLimitMinutes}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="ef-published"
              type="checkbox"
              className="size-5 cursor-pointer rounded border-border accent-primary focus-visible:ring-3 focus-visible:ring-ring/50"
              checked={form.published}
              onChange={(e) => set('published', e.target.checked)}
            />
            <Label htmlFor="ef-published" className="cursor-pointer">
              Published (visible to students)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Exam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
