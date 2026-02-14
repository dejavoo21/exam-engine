/**
 * Analytics service for tracking exam performance and trends
 */

import {
  getLatestExamResults,
  getQuestionStatsByExamSet,
  saveQuestionStats,
  getAttemptRecordsByExamSet,
  getDB
} from './db'
import { ExamResult, QuestionStats, AttemptRecord, Question } from './types'
import { generateId } from './utils'

export interface AnalyticsSummary {
  totalAttempts: number
  averageScore: number
  bestScore: number
  worstScore: number
  trend: { timestamp: number; score: number }[]
  weakQuestions: Question[]
  recentAttempts: ExamResult[]
}

export interface QuestionAnalytics {
  questionId: string
  timesAttempted: number
  correctRate: number
  lastAttempted: Date | null
  isFlagged: boolean
  strengthLevel: 'weak' | 'medium' | 'strong'
}

/**
 * Record an exam attempt
 */
export async function recordAttempt(result: ExamResult): Promise<void> {
  const record: AttemptRecord = {
    id: generateId(),
    examSetId: result.examSetId,
    resultId: result.id,
    timestamp: result.endTime,
    score: result.score,
    percentage: result.percentage
  }

  // Save attempt record to DB (would need to import from db)
  // await saveAttemptRecord(record)
}

/**
 * Update question statistics based on exam result
 */
export async function updateQuestionStats(result: ExamResult, questions: Question[]): Promise<void> {
  const dbInstance = await getDB()
  for (const question of questions) {
    const rawStats = await dbInstance.get('questionStats', `${result.examSetId}:${question.id}`)
    const existingStats = rawStats as QuestionStats | null

    const wasCorrect = result.answers[question.id] === question.options.find(o => o.isCorrect)?.id

    const stats: QuestionStats = {
      id: `${result.examSetId}:${question.id}`,
      questionId: question.id,
      examSetId: result.examSetId,
      timesAttempted: (existingStats?.timesAttempted ?? 0) + 1,
      timesCorrect: (existingStats?.timesCorrect ?? 0) + (wasCorrect ? 1 : 0),
      timesWrong: (existingStats?.timesWrong ?? 0) + (wasCorrect ? 0 : 1),
      lastAttemptedAt: Date.now(),
      lastCorrectAt: wasCorrect ? Date.now() : existingStats?.lastCorrectAt,
      isFlagged: result.flagged.includes(question.id)
    }

    await dbInstance.put('questionStats', stats)
  }
}

/**
 * Get analytics summary for an exam set
 */
export async function getAnalyticsSummary(
  examSetId: string,
  limit: number = 10
): Promise<AnalyticsSummary> {
  const recentAttempts = await getLatestExamResults(examSetId, limit)

  if (recentAttempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      trend: [],
      weakQuestions: [],
      recentAttempts: []
    }
  }

  const scores = recentAttempts.map(r => r.percentage)
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const bestScore = Math.max(...scores)
  const worstScore = Math.min(...scores)

  const trend = recentAttempts
    .reverse()
    .map(r => ({
      timestamp: r.endTime,
      score: r.percentage
    }))

  return {
    totalAttempts: recentAttempts.length,
    averageScore,
    bestScore,
    worstScore,
    trend,
    weakQuestions: [],
    recentAttempts
  }
}

/**
 * Get weak questions (missed >= 2 times)
 */
export async function getWeakQuestions(
  examSetId: string,
  questions: Question[]
): Promise<Question[]> {
  const stats = await getQuestionStatsByExamSet(examSetId)
  const weakQuestionIds = stats
    .filter(s => s.timesWrong >= 2)
    .map(s => s.questionId)

  return questions.filter(q => weakQuestionIds.includes(q.id))
}

/**
 * Get question analytics
 */
export async function getQuestionAnalytics(
  examSetId: string,
  questionId: string
): Promise<QuestionAnalytics | null> {
  const dbInstance = await getDB()
  const rawStats = await dbInstance.get('questionStats', `${examSetId}:${questionId}`)
  const stats = rawStats as QuestionStats | null

  if (!stats) {
    return null
  }

  const correctRate = stats.timesAttempted > 0 ? stats.timesCorrect / stats.timesAttempted : 0
  const strengthLevel: 'weak' | 'medium' | 'strong' =
    correctRate < 0.5 ? 'weak' : correctRate < 0.8 ? 'medium' : 'strong'

  return {
    questionId,
    timesAttempted: stats.timesAttempted,
    correctRate,
    lastAttempted: stats.lastAttemptedAt ? new Date(stats.lastAttemptedAt) : null,
    isFlagged: stats.isFlagged,
    strengthLevel
  }
}

/**
 * Get spaced repetition practice questions
 */
export async function getSpacedRepetitionQuestions(
  examSetId: string,
  questions: Question[],
  limit: number = 10,
  filterOptions?: {
    onlyWrong?: boolean
    onlyFlagged?: boolean
    onlyImageQuestions?: boolean
    types?: string[]
  }
): Promise<Question[]> {
  const allStats = await getQuestionStatsByExamSet(examSetId)

  let selected = questions

  // Apply filters
  if (filterOptions?.onlyWrong) {
    selected = selected.filter(q => {
      const stats = allStats.find(s => s.questionId === q.id)
      return stats && stats.timesWrong > 0
    })
  }

  if (filterOptions?.onlyFlagged) {
    selected = selected.filter(q => {
      const stats = allStats.find(s => s.questionId === q.id)
      return stats && stats.isFlagged
    })
  }

  if (filterOptions?.onlyImageQuestions) {
    selected = selected.filter(q => q.imageData)
  }

  if (filterOptions?.types && filterOptions.types.length > 0) {
    selected = selected.filter(q => filterOptions.types!.includes(q.type))
  }

  // Sort by: not-seen-recently first, then by lowest correct rate
  selected.sort((a, b) => {
    const statsA = allStats.find(s => s.questionId === a.id)
    const statsB = allStats.find(s => s.questionId === b.id)

    // Not attempted yet, prioritize
    if (!statsA) return -1
    if (!statsB) return 1

    // Sort by recency
    const recencyDiff = (statsA.lastAttemptedAt || 0) - (statsB.lastAttemptedAt || 0)
    if (recencyDiff !== 0) return recencyDiff

    // Then by correct rate
    const rateA = statsA.timesAttempted > 0 ? statsA.timesCorrect / statsA.timesAttempted : 0
    const rateB = statsB.timesAttempted > 0 ? statsB.timesCorrect / statsB.timesAttempted : 0

    return rateA - rateB
  })

  return selected.slice(0, limit)
}

/**
 * Get accuracy breakdown by question type
 */
export async function getAccuracyByType(result: ExamResult): Promise<Record<string, number>> {
  const byType: Record<string, number> = {}
  for (const [type, stats] of Object.entries(result.byType)) {
    byType[type] = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
  }
  return byType
}

/**
 * Get accuracy breakdown by image presence
 */
export async function getAccuracyByImage(result: ExamResult): Promise<Record<string, number>> {
  const withImage = result.byImage.withImage
  const withoutImage = result.byImage.withoutImage

  return {
    withImage: withImage.total > 0 ? (withImage.correct / withImage.total) * 100 : 0,
    withoutImage: withoutImage.total > 0 ? (withoutImage.correct / withoutImage.total) * 100 : 0
  }
}
