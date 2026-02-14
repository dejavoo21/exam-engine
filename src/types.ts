/**
 * Core data models for the Exam Engine
 */

export type QuestionType = 'MCQ' | 'TrueFalse' | 'ShortAnswer'

export interface Option {
  id: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  number: number
  type: QuestionType
  prompt: string
  options: Option[]
  correctAnswer?: string // For short answer questions
  explanation?: string
  imageData?: string // base64 encoded image
  imageSource?: 'pdf' | 'docx' | 'manual' // Where the image came from
  flaggedForReview?: boolean
  createdAt: number
  updatedAt: number
}

export interface ExamSet {
  id: string
  name: string
  description?: string
  questions: Question[]
  sourceFile?: string
  sourceFormat?: 'pdf' | 'docx' | 'txt'
  parserUsed?: string
  createdAt: number
  updatedAt: number
  version: number
}

export interface ExamSession {
  id: string
  examSetId: string
  selectedQuestionIds: string[]
  questionOrder: string[] // Shuffled order
  answers: Map<string, string> // questionId -> selectedOptionId or answer text
  flagged: Set<string> // flagged questionIds
  startTime: number
  endTime?: number
  duration?: number // in minutes
  timedMode: boolean
  timeLimit?: number // in minutes
  autoSubmitTime?: number // unix timestamp when to auto-submit
}

export interface ExamResult {
  id: string
  sessionId: string
  examSetId: string
  score: number
  totalQuestions: number
  percentage: number
  answers: Record<string, string>
  flagged: string[]
  startTime: number
  endTime: number
  duration: number // in minutes
  byType: Record<QuestionType, { total: number; correct: number }>
  byImage: { withImage: { total: number; correct: number }; withoutImage: { total: number; correct: number } }
}

export interface QuestionStats {
  questionId: string
  examSetId: string
  timesAttempted: number
  timesCorrect: number
  timesWrong: number
  lastAttemptedAt: number
  lastCorrectAt?: number
  isFlagged: boolean
}

export interface AttemptRecord {
  id: string
  examSetId: string
  resultId: string
  timestamp: number
  score: number
  percentage: number
}
