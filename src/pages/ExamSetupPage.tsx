import React, { useState } from 'react'
import { ExamSet, ExamSession } from '../types'
import { generateId, selectQuestionsForExam, shuffleQuestionOptions } from '../utils'
import { saveExamSession } from '../db'

interface ExamSetupPageProps {
  examSet: ExamSet
  onNavigate: (page: string, examSet?: ExamSet, session?: ExamSession) => void
}

export default function ExamSetupPage({ examSet, onNavigate }: ExamSetupPageProps) {
  const [questionCount, setQuestionCount] = useState(examSet.questions.length)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['MCQ', 'TrueFalse', 'ShortAnswer'])
  const [timedMode, setTimedMode] = useState(false)
  const [timeLimit, setTimeLimit] = useState(60)
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [filterImages, setFilterImages] = useState<'all' | 'only-images' | 'no-images'>('all')

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleStartExam = async () => {
    let questionsToUse = examSet.questions

    // Apply filters
    if (filterImages === 'only-images') {
      questionsToUse = questionsToUse.filter(q => q.imageData)
    } else if (filterImages === 'no-images') {
      questionsToUse = questionsToUse.filter(q => !q.imageData)
    }

    // Select questions
    const selectedQuestions = selectQuestionsForExam(
      questionsToUse,
      questionCount,
      selectedTypes as any,
      undefined,
      shuffleQuestions
    )

    if (selectedQuestions.length === 0) {
      alert('No questions match the selected criteria')
      return
    }

    // Shuffle options if requested
    const questionsWithShuffledOptions = shuffleOptions
      ? selectedQuestions.map(q => shuffleQuestionOptions(q))
      : selectedQuestions

    // Create session
    const questionOrder = questionsWithShuffledOptions.map(q => q.id)
    const session: ExamSession = {
      id: generateId(),
      examSetId: examSet.id,
      selectedQuestionIds: questionsWithShuffledOptions.map(q => q.id),
      questionOrder,
      answers: new Map(),
      flagged: new Set(),
      startTime: Date.now(),
      timedMode,
      timeLimit: timedMode ? timeLimit : undefined,
      autoSubmitTime: timedMode ? Date.now() + timeLimit * 60 * 1000 : undefined
    }

    await saveExamSession(session)
    onNavigate('exam-mode', examSet, session)
  }

  return (
    <div className="page exam-setup-page">
      <h2>Setup: {examSet.name}</h2>

      <div className="setup-form">
        <div className="form-group">
          <label>Number of Questions:</label>
          <input
            type="number"
            min="1"
            max={examSet.questions.length}
            value={questionCount}
            onChange={e => setQuestionCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), examSet.questions.length))}
          />
          <small>Total available: {examSet.questions.length}</small>
        </div>

        <div className="form-group">
          <label>Question Types:</label>
          <div className="checkbox-group">
            {['MCQ', 'TrueFalse', 'ShortAnswer'].map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Filter by Images:</label>
          <select value={filterImages} onChange={e => setFilterImages(e.target.value as any)}>
            <option value="all">All questions</option>
            <option value="only-images">Only questions with images</option>
            <option value="no-images">Only questions without images</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={e => setShuffleQuestions(e.target.checked)}
            />
            Shuffle questions
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={shuffleOptions}
              onChange={e => setShuffleOptions(e.target.checked)}
            />
            Shuffle answer options
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={timedMode}
              onChange={e => setTimedMode(e.target.checked)}
            />
            Timed exam
          </label>

          {timedMode && (
            <div className="form-group" style={{ marginLeft: '20px' }}>
              <label>Time Limit (minutes):</label>
              <input
                type="number"
                min="1"
                value={timeLimit}
                onChange={e => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button onClick={() => window.history.back()} className="btn btn-secondary">
            Back
          </button>
          <button onClick={handleStartExam} className="btn btn-primary btn-large">
            Start Exam
          </button>
        </div>
      </div>
    </div>
  )
}
