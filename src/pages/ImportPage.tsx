import React, { useState } from 'react'
import { detectAndParseDocument } from '../parsers'
import { NumberedQuestionsWithOptionsParser, InlineQAParser, TwoFileExamParser } from '../parsers'
import { ExamSet } from '../types'
import { generateId } from '../utils'
import { saveExamSet } from '../db'

interface ImportPageProps {
  onNavigate: (page: string, examSet?: ExamSet) => void
  onUpdated: () => void
}

export default function ImportPage({ onNavigate, onUpdated }: ImportPageProps) {
  const [step, setStep] = useState<'upload' | 'parser' | 'preview'>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [parsedText, setParsedText] = useState<string>('')
  const [format, setFormat] = useState<'pdf' | 'docx' | 'txt'>('txt')
  const [selectedParser, setSelectedParser] = useState<string>('NumberedQuestionsWithOptionsParser')
  const [examSet, setExamSet] = useState<ExamSet | null>(null)
  const [examName, setExamName] = useState<string>('')
  const [examDescription, setExamDescription] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.currentTarget.files || [])
    setFiles(selectedFiles)

    if (selectedFiles.length > 0) {
      setLoading(true)
      try {
        const file = selectedFiles[0]
        const { text, format: detectedFormat } = await detectAndParseDocument(file)
        setParsedText(text)
        setFormat(detectedFormat)
        setStep('parser')
      } catch (error) {
        console.error('Failed to parse document:', error)
        alert('Failed to parse document')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleParse = async () => {
    setLoading(true)
    try {
      let parser: any
      let questions: any[] = []

      switch (selectedParser) {
        case 'NumberedQuestionsWithOptionsParser':
          parser = new NumberedQuestionsWithOptionsParser()
          const result1 = parser.parse(parsedText)
          questions = result1.questions
          break

        case 'InlineQAParser':
          parser = new InlineQAParser()
          const result2 = parser.parse(parsedText)
          questions = result2.questions
          break

        case 'TwoFileExamParser':
          if (files.length < 2) {
            alert('Two-file parser requires 2 files')
            return
          }
          parser = new TwoFileExamParser()
          const questions1 = parser.parseQuestions(parsedText)
          const { text: text2 } = await detectAndParseDocument(files[1])
          const answers = parser.parseAnswers(text2)
          questions = parser.merge(questions1, answers)
          break
      }

      if (questions.length === 0) {
        alert('No questions parsed')
        return
      }

      const newExamSet: ExamSet = {
        id: generateId(),
        name: examName || `Exam ${new Date().toLocaleDateString()}`,
        description: examDescription,
        questions,
        sourceFile: files[0].name,
        sourceFormat: format,
        parserUsed: selectedParser,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1
      }

      setExamSet(newExamSet)
      setStep('preview')
    } catch (error) {
      console.error('Failed to parse:', error)
      alert('Failed to parse exam')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveExam = async () => {
    if (!examSet) return

    setLoading(true)
    try {
      await saveExamSet(examSet)
      onUpdated()
      alert('Exam imported successfully')
      onNavigate('exam-list')
    } catch (error) {
      console.error('Failed to save exam:', error)
      alert('Failed to save exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page import-page">
      <h2>Import Exam</h2>

      {step === 'upload' && (
        <div className="import-step">
          <h3>Step 1: Upload Document</h3>
          <div className="upload-area">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.docx,.doc,.txt"
              style={{ marginBottom: '1rem' }}
            />
            <p>Supported formats: PDF, DOCX, TXT</p>
          </div>
        </div>
      )}

      {step === 'parser' && (
        <div className="import-step">
          <h3>Step 2: Select Parser</h3>
          <div className="form-group">
            <label>Parser Type:</label>
            <select value={selectedParser} onChange={e => setSelectedParser(e.target.value)}>
              <option value="NumberedQuestionsWithOptionsParser">Numbered Questions with Options</option>
              <option value="InlineQAParser">Inline Q&A</option>
              <option value="TwoFileExamParser">Two-File Format</option>
            </select>
          </div>

          <div className="form-group">
            <label>Exam Name:</label>
            <input
              type="text"
              value={examName}
              onChange={e => setExamName(e.target.value)}
              placeholder="e.g., Biology Final"
            />
          </div>

          <div className="form-group">
            <label>Description (optional):</label>
            <textarea
              value={examDescription}
              onChange={e => setExamDescription(e.target.value)}
              placeholder="Add a description..."
            />
          </div>

          <div className="parser-preview">
            <h4>Preview (first 500 chars):</h4>
            <pre>{parsedText.substring(0, 500)}...</pre>
          </div>

          <div className="form-actions">
            <button onClick={() => setStep('upload')} className="btn btn-secondary">
              Back
            </button>
            <button onClick={handleParse} className="btn btn-primary" disabled={loading}>
              {loading ? 'Parsing...' : 'Parse'}
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && examSet && (
        <div className="import-step">
          <h3>Step 3: Review</h3>
          <div className="exam-preview">
            <h4>{examSet.name}</h4>
            <p>{examSet.description}</p>
            <p>Total questions: {examSet.questions.length}</p>

            <div className="questions-preview">
              {examSet.questions.slice(0, 5).map((q, idx) => (
                <div key={idx} className="question-preview">
                  <p>
                    <strong>Q{q.number}:</strong> {q.prompt.substring(0, 100)}...
                  </p>
                  <ul>
                    {q.options.map((opt, i) => (
                      <li key={i} className={opt.isCorrect ? 'correct' : ''}>
                        {opt.text} {opt.isCorrect && '✓'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {examSet.questions.length > 5 && <p>... and {examSet.questions.length - 5} more</p>}
            </div>
          </div>

          <div className="form-actions">
            <button onClick={() => onNavigate('preview-editor', examSet)} className="btn btn-secondary">
              Edit Questions
            </button>
            <button onClick={handleSaveExam} className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Exam'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
