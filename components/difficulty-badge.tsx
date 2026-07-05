import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Difficulty } from '@/lib/types'

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; className: string }> = {
  easy: {
    label: 'Easy',
    className: 'border-brand-green/25 bg-brand-green-light text-brand-green-dark',
  },
  medium: {
    label: 'Medium',
    className: 'border-brand-orange/30 bg-brand-orange-light text-brand-orange',
  },
  hard: {
    label: 'Hard',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
}

interface DifficultyBadgeProps {
  difficulty: Difficulty
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty]
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-extrabold', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
