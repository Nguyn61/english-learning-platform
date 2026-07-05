import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Skill } from '@/lib/types'

const SKILL_CONFIG: Record<Skill, { label: string; className: string }> = {
  reading: {
    label: 'Reading',
    className: 'border-tag-blue/25 bg-blue-50 text-blue-700',
  },
  listening: {
    label: 'Listening',
    className: 'border-yellow-300 bg-yellow-50 text-yellow-700',
  },
  grammar: {
    label: 'Grammar',
    className: 'border-brand-green/25 bg-brand-green-light text-brand-green-dark',
  },
  vocabulary: {
    label: 'Vocabulary',
    className: 'border-tag-orange/30 bg-orange-50 text-orange-700',
  },
  writing: {
    label: 'Writing',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  speaking: {
    label: 'Speaking',
    className: 'border-teal-200 bg-teal-50 text-teal-700',
  },
}

interface SkillBadgeProps {
  skill: Skill
  className?: string
}

export function SkillBadge({ skill, className }: SkillBadgeProps) {
  const config = SKILL_CONFIG[skill]
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-extrabold', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

export function skillLabel(skill: Skill): string {
  return SKILL_CONFIG[skill].label
}
