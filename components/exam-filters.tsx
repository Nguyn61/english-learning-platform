'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Skill, Difficulty } from '@/lib/types'

const SKILLS: { value: Skill | 'all'; label: string }[] = [
  { value: 'all', label: 'All Skills' },
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'writing', label: 'Writing' },
  { value: 'speaking', label: 'Speaking' },
]

const DIFFICULTIES: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function ExamFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const skill = searchParams.get('skill') ?? 'all'
  const difficulty = searchParams.get('difficulty') ?? 'all'
  const q = searchParams.get('q') ?? ''

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all' || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`/?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const hasActiveFilters = skill !== 'all' || difficulty !== 'all' || q !== ''

  function clearAll() {
    router.push('/', { scroll: false })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-end">
        <div className="space-y-1.5">
          <label htmlFor="exam-search" className="text-sm font-bold text-foreground">
            Search exams
          </label>
          <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="exam-search"
            type="search"
            placeholder="Search by exam title or skill..."
            value={q}
            onChange={(e) => updateParam('q', e.target.value)}
            className="rounded-full border-border bg-muted/70 pl-10 pr-12 font-semibold shadow-none focus-visible:border-primary"
            aria-label="Search exams"
          />
          {q && (
            <button
              type="button"
              onClick={() => updateParam('q', '')}
              className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="justify-self-start rounded-full text-xs lg:justify-self-end">
            <X className="size-3" data-icon="inline-start" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-bold uppercase text-muted-foreground">Skill</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by skill">
        {SKILLS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => updateParam('skill', value)}
            className={cn(
              'min-h-10 rounded-full border px-3 py-2 text-xs font-extrabold outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50',
              skill === value
                ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary hover:text-primary'
            )}
            aria-pressed={skill === value}
          >
            {label}
          </button>
        ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-bold uppercase text-muted-foreground">Level</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by difficulty">
        {DIFFICULTIES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => updateParam('difficulty', value)}
            className={cn(
              'min-h-10 rounded-full border px-3 py-2 text-xs font-extrabold outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50',
              difficulty === value
                ? 'border-brand-orange bg-brand-orange text-white shadow-sm shadow-brand-orange/20'
                : 'border-border bg-muted/50 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-light hover:text-brand-orange'
            )}
            aria-pressed={difficulty === value}
          >
            {label}
          </button>
        ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold text-muted-foreground">Active:</span>
          {skill !== 'all' && <Badge variant="secondary" className="text-xs capitalize">{skill}</Badge>}
          {difficulty !== 'all' && <Badge variant="secondary" className="text-xs capitalize">{difficulty}</Badge>}
          {q && <Badge variant="secondary" className="text-xs">&ldquo;{q}&rdquo;</Badge>}
        </div>
      )}
    </div>
  )
}
