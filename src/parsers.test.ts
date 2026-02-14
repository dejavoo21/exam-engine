import { describe, it, expect } from 'vitest'
import { NumberedQuestionsWithOptionsParser, InlineQAParser } from '../src/parsers'

describe('NumberedQuestionsWithOptionsParser', () => {
  it('should parse numbered questions with options', () => {
    const text = `
1. What is 2 + 2?
a) 3
b) 4
c) 5
d) 6
Answer: b
Explanation: 2 + 2 equals 4

2. What is the capital of France?
a) London
b) Berlin
c) Paris
d) Madrid
Answer: c
Explanation: Paris is the capital of France
    `

    const parser = new NumberedQuestionsWithOptionsParser()
    const result = parser.parse(text)

    expect(result.isValid).toBe(true)
    expect(result.questions.length).toBe(2)
    expect(result.questions[0].prompt).toBe('What is 2 + 2?')
    expect(result.questions[0].options.length).toBe(4)
    expect(result.questions[0].options[1].isCorrect).toBe(true)
    expect(result.questions[0].explanation).toBe('2 + 2 equals 4')
  })

  it('should handle missing explanations', () => {
    const text = `
1. Simple question?
a) Option A
b) Option B
Answer: a
    `

    const parser = new NumberedQuestionsWithOptionsParser()
    const result = parser.parse(text)

    expect(result.questions.length).toBe(1)
    expect(result.questions[0].explanation).toBeUndefined()
  })
})

describe('InlineQAParser', () => {
  it('should parse inline Q&A format', () => {
    const text = `
Q: What is the largest planet?
A: a) Mercury, b) Venus, c) Jupiter, d) Saturn
Correct: c
Explanation: Jupiter is the largest planet in our solar system
    `

    const parser = new InlineQAParser()
    const result = parser.parse(text)

    expect(result.isValid).toBe(true)
    expect(result.questions.length).toBe(1)
    expect(result.questions[0].prompt).toBe('What is the largest planet?')
    expect(result.questions[0].options.length).toBe(4)
  })
})
