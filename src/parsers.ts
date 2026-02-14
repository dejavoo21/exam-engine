/**
 * Document parsers for different exam formats
 */

import { Question, ExamSet } from './types'
import * as mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ParseResult {
  questions: Question[]
  parserUsed: string
  isValid: boolean
  errors: string[]
}

/**
 * Numbered Questions with Options Parser
 * Format:
 * 1. Question text here?
 * a) Option A
 * b) Option B
 * c) Option C
 * d) Option D
 * Answer: a
 * Explanation: This is the explanation
 */
export class NumberedQuestionsWithOptionsParser {
  parse(text: string): ParseResult {
    const errors: string[] = []
    const questions: Question[] = []
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    
    let currentQuestion: Partial<Question> | null = null
    let questionNumber = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Check if line starts with a number (question)
      const qMatch = line.match(/^(\d+)\.\s+(.+)/)
      if (qMatch) {
        if (currentQuestion && currentQuestion.prompt && currentQuestion.options?.length) {
          questions.push({
            id: `q-${++questionNumber}`,
            number: questionNumber,
            type: 'MCQ',
            prompt: currentQuestion.prompt || '',
            options: currentQuestion.options as any,
            explanation: currentQuestion.explanation,
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
        }
        currentQuestion = {
          prompt: qMatch[2],
          options: []
        }
        continue
      }

      if (!currentQuestion) continue

      // Check for options (a, b, c, d, etc.)
      const optMatch = line.match(/^[a-z]\)\s+(.+)/)
      if (optMatch) {
        const optionLetter = line.charAt(0).toLowerCase()
        if (!currentQuestion.options) currentQuestion.options = []
        ;(currentQuestion.options as any).push({
          id: optionLetter,
          text: optMatch[1],
          isCorrect: false
        })
        continue
      }

      // Check for answer
      const ansMatch = line.match(/^Answer:\s*([a-z])/i)
      if (ansMatch && currentQuestion.options) {
        const correctId = ansMatch[1].toLowerCase()
        ;(currentQuestion.options as any).forEach((opt: any) => {
          opt.isCorrect = opt.id === correctId
        })
        continue
      }

      // Check for explanation
      const expMatch = line.match(/^Explanation:\s+(.+)/)
      if (expMatch) {
        currentQuestion.explanation = expMatch[1]
      }
    }

    // Add last question
    if (currentQuestion && currentQuestion.prompt && currentQuestion.options?.length) {
      questions.push({
        id: `q-${++questionNumber}`,
        number: questionNumber,
        type: 'MCQ',
        prompt: currentQuestion.prompt || '',
        options: currentQuestion.options as any,
        explanation: currentQuestion.explanation,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }

    if (questions.length === 0) {
      errors.push('No questions found in the expected format')
    }

    return {
      questions,
      parserUsed: 'NumberedQuestionsWithOptionsParser',
      isValid: questions.length > 0,
      errors
    }
  }
}

/**
 * Inline Q&A Parser
 * Format:
 * Q: Question 1?
 * A: a) Option A, b) Option B, c) Option C, d) Option D
 * Correct: a
 */
export class InlineQAParser {
  parse(text: string): ParseResult {
    const errors: string[] = []
    const questions: Question[] = []
    const qaPairs = text.split(/Q:\s+/i).slice(1)
    let questionNumber = 0

    for (const pair of qaPairs) {
      const lines = pair.split('\n').map(l => l.trim())
      const questionText = lines[0]
      
      let options: Question['options'] = []
      let correctId = ''
      let explanation = ''

      for (const line of lines.slice(1)) {
        if (line.match(/^A:\s+/i)) {
          const optionText = line.replace(/^A:\s+/i, '')
          const optMatches = optionText.match(/[a-z]\)\s*([^,]+)/gi)
          if (optMatches) {
            optMatches.forEach(opt => {
              const m = opt.match(/^([a-z])\)\s*(.+)/)
              if (m) {
                options.push({
                  id: m[1].toLowerCase(),
                  text: m[2].trim(),
                  isCorrect: false
                })
              }
            })
          }
        }
        
        if (line.match(/^Correct:\s*/i)) {
          correctId = line.replace(/^Correct:\s*/i, '').toLowerCase()
          options = options.map(opt => ({
            ...opt,
            isCorrect: opt.id === correctId
          }))
        }

        if (line.match(/^Explanation:\s*/i)) {
          explanation = line.replace(/^Explanation:\s*/i, '')
        }
      }

      if (questionText && options.length > 0) {
        questions.push({
          id: `q-${++questionNumber}`,
          number: questionNumber,
          type: 'MCQ',
          prompt: questionText,
          options,
          explanation: explanation || undefined,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      }
    }

    if (questions.length === 0) {
      errors.push('No Q&A pairs found in the expected format')
    }

    return {
      questions,
      parserUsed: 'InlineQAParser',
      isValid: questions.length > 0,
      errors
    }
  }
}

/**
 * Two-File Exam Parser
 * Expects questions from one file and answers from another
 */
export class TwoFileExamParser {
  parseQuestions(text: string): Question[] {
    // Parse question file - similar to numbered format
    const parser = new NumberedQuestionsWithOptionsParser()
    const result = parser.parse(text)
    return result.questions.map(q => ({
      ...q,
      options: q.options.map(opt => ({ ...opt, isCorrect: false }))
    }))
  }

  parseAnswers(text: string): Map<number, { answer: string; explanation?: string }> {
    const answers = new Map<number, { answer: string; explanation?: string }>()
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

    let currentQuestion = 0
    for (const line of lines) {
      const qMatch = line.match(/^(\d+)\.\s+(.+)/)
      if (qMatch) {
        currentQuestion = parseInt(qMatch[1])
        answers.set(currentQuestion, { answer: qMatch[2] })
        continue
      }

      if (currentQuestion === 0) continue

      const ansMatch = line.match(/^Answer:\s*(.+)/i)
      if (ansMatch && answers.has(currentQuestion)) {
        answers.get(currentQuestion)!.answer = ansMatch[1]
        continue
      }

      const expMatch = line.match(/^Explanation:\s+(.+)/i)
      if (expMatch && answers.has(currentQuestion)) {
        answers.get(currentQuestion)!.explanation = expMatch[1]
      }
    }

    return answers
  }

  merge(questions: Question[], answers: Map<number, { answer: string; explanation?: string }>): Question[] {
    return questions.map(q => {
      const answer = answers.get(q.number)
      if (!answer) return q

      // Try to match answer to option
      const matchedOption = q.options.find(opt =>
        opt.text.toLowerCase().includes(answer.answer.toLowerCase()) ||
        answer.answer.toLowerCase().includes(opt.text.toLowerCase())
      )

      if (matchedOption) {
        q.options = q.options.map(opt => ({
          ...opt,
          isCorrect: opt.id === matchedOption.id
        }))
      }

      return {
        ...q,
        explanation: answer.explanation,
        updatedAt: Date.now()
      }
    })
  }
}

/**
 * PDF Parser - extracts text from PDF
 */
export async function parsePDF(file: File): Promise<{ text: string; images: string[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  const images: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    text += textContent.items.map((item: any) => item.str).join(' ') + '\n'
  }

  return { text, images }
}

/**
 * DOCX Parser - extracts text from DOCX
 */
export async function parseDOCX(file: File): Promise<{ text: string; images: string[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return {
    text: result.value,
    images: []
  }
}

/**
 * Auto-detect and parse document
 */
export async function detectAndParseDocument(
  file: File
): Promise<{ text: string; format: 'pdf' | 'docx' | 'txt'; images: string[] }> {
  const filename = file.name.toLowerCase()

  if (filename.endsWith('.pdf')) {
    const { text, images } = await parsePDF(file)
    return { text, format: 'pdf', images }
  }

  if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
    const { text, images } = await parseDOCX(file)
    return { text, format: 'docx', images }
  }

  // Default to text
  const text = await file.text()
  return { text, format: 'txt', images: [] }
}
