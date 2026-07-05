// ─── Domain Types ───────────────────────────────────────────────────────────

export type Skill = 'reading' | 'listening' | 'grammar' | 'vocabulary' | 'writing' | 'speaking'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type ExamMode = 'practice' | 'real-test'

export interface Answer {
  id: string
  text: string
}

export interface Question {
  id: string
  examId: string
  order: number
  text: string
  audioUrl?: string        // for listening questions
  imageUrl?: string        // for reading comprehension with images
  passage?: string         // long reading passage
  answers: Answer[]
  correctAnswerId: string
  explanation: string
  skill: Skill
  difficulty: Difficulty
}

export interface Exam {
  id: string
  title: string
  description: string
  skill: Skill
  difficulty: Difficulty
  questionCount: number
  timeLimitMinutes: number
  attempts: number          // number of times any user has attempted it (displayed count)
  createdAt: string         // ISO string
  updatedAt: string
  published: boolean
}

// ─── User Attempt / Results ──────────────────────────────────────────────────

export interface UserAnswer {
  questionId: string
  selectedAnswerId: string | null
  isCorrect: boolean
  timeSpentSeconds?: number
}

export interface ExamResult {
  id: string
  examId: string
  examTitle: string
  examSkill: Skill
  mode: ExamMode
  startedAt: string
  completedAt: string
  durationSeconds: number
  score: number            // 0-100
  correctCount: number
  totalCount: number
  userAnswers: UserAnswer[]
  passed: boolean          // score >= 60
}

// ─── Admin CMS Form ───────────────────────────────────────────────────────────

export interface ExamFormData {
  title: string
  description: string
  skill: Skill
  difficulty: Difficulty
  timeLimitMinutes: number
  published: boolean
}

export interface QuestionFormData {
  text: string
  passage?: string
  answers: { id: string; text: string }[]
  correctAnswerId: string
  explanation: string
  skill: Skill
  difficulty: Difficulty
}
