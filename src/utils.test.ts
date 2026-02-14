import { describe, it, expect } from 'vitest'
import { shuffleArray, generateId, formatCountdown, encodeExamSetToURL, decodeExamSetFromURL } from '../src/utils'
import { ExamSet } from '../src/types'

describe('Utility Functions', () => {
  it('should shuffle array', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(arr)
    expect(shuffled.length).toBe(arr.length)
    // Should not be in same order (very unlikely after shuffle)
  })

  it('should generate unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
    expect(id1.length).toBeGreaterThan(0)
  })

  it('should format countdown time', () => {
    expect(formatCountdown(65)).toBe('1:05')
    expect(formatCountdown(5)).toBe('0:05')
    expect(formatCountdown(0)).toBe('0:00')
  })

  it('should encode and decode exam sets', () => {
    const examSet: ExamSet = {
      id: 'test-1',
      name: 'Test Exam',
      questions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1
    }

    const encoded = encodeExamSetToURL(examSet)
    expect(encoded).toContain('#import=')

    const decoded = decodeExamSetFromURL(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded?.name).toBe('Test Exam')
  })
})
