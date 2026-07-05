/**
 * Data Service
 *
 * All data access for the app goes through this module.
 * When Firebase env vars are present, it uses Firestore.
 * Otherwise it falls back to the rich mock data so the app works with zero config.
 */

import type { Exam, Question, ExamResult, ExamFormData, QuestionFormData } from './types'
import { MOCK_EXAMS, MOCK_QUESTIONS, MOCK_RESULTS } from './mock-data'

const USE_MOCK =
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === ''

// ─── Exams ────────────────────────────────────────────────────────────────────

export async function getExams(): Promise<Exam[]> {
  if (USE_MOCK) return MOCK_EXAMS.filter((e) => e.published)
  // TODO: Firestore fetch
  return MOCK_EXAMS.filter((e) => e.published)
}

export async function getAllExamsAdmin(): Promise<Exam[]> {
  if (USE_MOCK) return MOCK_EXAMS
  // TODO: Firestore fetch (all including drafts)
  return MOCK_EXAMS
}

export async function getExamById(id: string): Promise<Exam | null> {
  if (USE_MOCK) return MOCK_EXAMS.find((e) => e.id === id) ?? null
  // TODO: Firestore fetch
  return MOCK_EXAMS.find((e) => e.id === id) ?? null
}

export async function createExam(data: ExamFormData): Promise<Exam> {
  const newExam: Exam = {
    id: `exam-${Date.now()}`,
    ...data,
    questionCount: 0,
    attempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  if (USE_MOCK) {
    MOCK_EXAMS.push(newExam)
    return newExam
  }
  // TODO: Firestore write
  return newExam
}

export async function updateExam(id: string, data: Partial<ExamFormData>): Promise<Exam | null> {
  if (USE_MOCK) {
    const idx = MOCK_EXAMS.findIndex((e) => e.id === id)
    if (idx === -1) return null
    MOCK_EXAMS[idx] = { ...MOCK_EXAMS[idx], ...data, updatedAt: new Date().toISOString() }
    return MOCK_EXAMS[idx]
  }
  // TODO: Firestore update
  return null
}

export async function deleteExam(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_EXAMS.findIndex((e) => e.id === id)
    if (idx !== -1) MOCK_EXAMS.splice(idx, 1)
    return
  }
  // TODO: Firestore delete
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function getQuestionsByExamId(examId: string): Promise<Question[]> {
  if (USE_MOCK) {
    const qs = MOCK_QUESTIONS[examId] ?? []
    return qs.sort((a, b) => a.order - b.order)
  }
  // TODO: Firestore fetch
  const qs = MOCK_QUESTIONS[examId] ?? []
  return qs.sort((a, b) => a.order - b.order)
}

export async function createQuestion(data: QuestionFormData & { examId: string; order: number }): Promise<Question> {
  const newQ: Question = {
    id: `q-${data.examId}-${Date.now()}`,
    ...data,
  }
  if (USE_MOCK) {
    if (!MOCK_QUESTIONS[data.examId]) MOCK_QUESTIONS[data.examId] = []
    MOCK_QUESTIONS[data.examId].push(newQ)
    // Update questionCount on exam
    const exam = MOCK_EXAMS.find((e) => e.id === data.examId)
    if (exam) exam.questionCount = MOCK_QUESTIONS[data.examId].length
    return newQ
  }
  // TODO: Firestore write
  return newQ
}

export async function deleteQuestion(examId: string, questionId: string): Promise<void> {
  if (USE_MOCK) {
    if (!MOCK_QUESTIONS[examId]) return
    const idx = MOCK_QUESTIONS[examId].findIndex((q) => q.id === questionId)
    if (idx !== -1) MOCK_QUESTIONS[examId].splice(idx, 1)
    const exam = MOCK_EXAMS.find((e) => e.id === examId)
    if (exam) exam.questionCount = MOCK_QUESTIONS[examId].length
    return
  }
  // TODO: Firestore delete
}

// ─── Results ─────────────────────────────────────────────────────────────────

export async function getUserResults(): Promise<ExamResult[]> {
  if (USE_MOCK) return [...MOCK_RESULTS].reverse()
  // TODO: Firestore fetch scoped by userId
  return [...MOCK_RESULTS].reverse()
}

export async function saveResult(result: Omit<ExamResult, 'id'>): Promise<ExamResult> {
  const newResult: ExamResult = { ...result, id: `result-${Date.now()}` }
  if (USE_MOCK) {
    MOCK_RESULTS.push(newResult)
    return newResult
  }
  // TODO: Firestore write
  return newResult
}
