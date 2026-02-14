/**
 * Utility functions for sharing, encoding, and data manipulation
 */

import { ExamSet, Question } from './types'
import LZ from 'lz-string'

/**
 * Export ExamSet to JSON and encode as URL fragment
 */
export function encodeExamSetToURL(examSet: ExamSet): string {
  const json = JSON.stringify(examSet)
  const compressed = LZ.compressToBase64(json)
  return `#import=${compressed}`
}

/**
 * Decode URL fragment and return ExamSet
 */
export function decodeExamSetFromURL(fragment: string): ExamSet | null {
  try {
    const match = fragment.match(/#import=(.+)/)
    if (!match) return null
    
    const compressed = match[1]
    const json = LZ.decompressFromBase64(compressed)
    if (!json) return null
    
    return JSON.parse(json) as ExamSet
  } catch {
    return null
  }
}

/**
 * Generate share code (shorter version for copy/paste)
 */
export function generateShareCode(examSet: ExamSet): string {
  const json = JSON.stringify(examSet)
  const compressed = LZ.compressToBase64(json)
  return compressed
}

/**
 * Import from share code
 */
export function importFromShareCode(code: string): ExamSet | null {
  try {
    const json = LZ.decompressFromBase64(code)
    if (!json) return null
    return JSON.parse(json) as ExamSet
  } catch {
    return null
  }
}

/**
 * Shuffle array in place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Get questions for exam session
 */
export function selectQuestionsForExam(
  allQuestions: Question[],
  count: number,
  types?: ('MCQ' | 'TrueFalse' | 'ShortAnswer')[],
  numbers?: (number | { start: number; end: number })[],
  shuffle: boolean = false
): Question[] {
  let selected = [...allQuestions]

  // Filter by type if specified
  if (types && types.length > 0) {
    selected = selected.filter(q => types.includes(q.type))
  }

  // Filter by question numbers if specified
  if (numbers && numbers.length > 0) {
    const numberSet = new Set<number>()
    for (const n of numbers) {
      if (typeof n === 'number') {
        numberSet.add(n)
      } else {
        for (let i = n.start; i <= n.end; i++) {
          numberSet.add(i)
        }
      }
    }
    selected = selected.filter(q => numberSet.has(q.number))
  }

  // Limit to requested count
  if (count > 0 && selected.length > count) {
    selected = selected.slice(0, count)
  }

  // Shuffle if requested
  if (shuffle) {
    selected = shuffleArray(selected)
  }

  return selected
}

/**
 * Shuffle question options
 */
export function shuffleQuestionOptions(question: Question): Question {
  return {
    ...question,
    options: shuffleArray(question.options)
  }
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format time in minutes and seconds
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * Convert seconds to formatted countdown
 */
export function formatCountdown(seconds: number): string {
  if (seconds < 0) return '00:00'
  return formatTime(seconds)
}

/**
 * Check if time is running out (less than 5 minutes)
 */
export function isRunningOut(remainingSeconds: number): boolean {
  return remainingSeconds > 0 && remainingSeconds <= 300
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

/**
 * Parse range string like "1-5" into numbers
 */
export function parseQuestionRange(rangeStr: string): number[] {
  const parts = rangeStr.split('-').map(p => parseInt(p.trim()))
  if (parts.length === 1) {
    return parts
  }
  const [start, end] = parts
  const result = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}

/**
 * Get base path for GitHub Pages
 */
export function getBasePath(): string {
  const base = (import.meta as any).env?.BASE_URL || '/'
  return base
}

/**
 * Load share link from URL on startup
 */
export function getShareLinkFromURL(): string | null {
  const hash = window.location.hash
  if (hash.startsWith('#import=')) {
    return hash.substring(8) // Remove '#import='
  }
  return null
}
