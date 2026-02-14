import React, { useState, useEffect } from 'react'
import { ExamSet, ExamSession, ExamResult } from '../types'
import { saveExamSession, saveExamResult } from '../db'
import { formatCountdown, isRunningOut } from '../utils'

interface ExamModePageProps {
  examSet: ExamSet
  session: ExamSession
  onNavigate: (page: string, examSet?: ExamSet, session?: ExamSession, result?: ExamResult) => void
  onSessionUpdate: (session: ExamSession) => void
}

export default function ExamModePage({ examSet, session, onNavigate, onSessionUpdate }: ExamModePageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [autoSubmitted, setAutoSubmitted] = useState(false)

  const questions = examSet.questions.filter(q => session.selectedQuestionIds.includes(q.id))
  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    if (!session.timedMode || !session.autoSubmitTime) return

    const timer = setInterval(() => {
      const now = Date.now()
      const remaining = Math.ceil((session.autoSubmitTime! - now) / 1000)

      if (remaining <= 0) {
        handleSubmitExam()
        setAutoSubmitted(true)
        clearInterval(timer)
      } else {
        setTimeRemaining(remaining)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [session])

  const handleAnswerQuestion = (optionId: string) => {
    const newSession = { ...session }
    newSession.answers.set(currentQuestion.id, optionId)
    onSessionUpdate(newSession)
  }

  const handleFlagQuestion = () => {
    const newSession = { ...session }
    if (newSession.flagged.has(currentQuestion.id)) {
      newSession.flagged.delete(currentQuestion.id)
    } else {
      newSession.flagged.add(currentQuestion.id)
    }
    onSessionUpdate(newSession)
  }

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      await saveExamSession(session)
    }
  }

  const handlePrevious = async () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      await saveExamSession(session)
    }
  }

  const handleSubmitExam = async () => {
    if (!confirm('Submit exam?')) return

    const answeredCount = session.answers.size
    let correctCount = 0

    const byType: Record<string, { total: number; correct: number }> = {}
    const byImage = { withImage: { total: 0, correct: 0 }, withoutImage: { total: 0, correct: 0 } }

    for (const question of questions) {
      const userAnswer = session.answers.get(question.id)
      const correctOption = question.options.find(o => o.isCorrect)

      const isCorrect = userAnswer === correctOption?.id

      if (isCorrect) correctCount++

      if (!byType[question.type]) {
        byType[question.type] = { total: 0, correct: 0 }
      }
      byType[question.type].total++
      if (isCorrect) byType[question.type].correct++

      if (question.imageData) {
        byImage.withImage.total++
        if (isCorrect) byImage.withImage.correct++
      } else {
        byImage.withoutImage.total++
        if (isCorrect) byImage.withoutImage.correct++
      }
    }

    const result: ExamResult = {
      id: `result-${Date.now()}`,
      sessionId: session.id,
      examSetId: examSet.id,
      score: correctCount,
      totalQuestions: answeredCount,
      percentage: answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0,
      answers: Object.fromEntries(session.answers),
      flagged: Array.from(session.flagged),
      startTime: session.startTime,
      endTime: Date.now(),
      duration: Math.ceil((Date.now() - session.startTime) / 60000),
      byType,
      byImage
    }

    await saveExamResult(result)
    onNavigate('results', examSet, session, result)
  }

  if (!currentQuestion) {
    return <div className="page">No questions found</div>
  }

  const currentAnswer = session.answers.get(currentQuestion.id)
  const isFlagged = session.flagged.has(currentQuestion.id)
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="page exam-mode-page">
      <div className="exam-header">
        <div className="exam-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="exam-info">
          <span>{currentQuestionIndex + 1} / {questions.length}</span>
          {session.timedMode && timeRemaining !== null && (
            <span className={`timer ${isRunningOut(timeRemaining) ? 'warning' : ''}`}>
              ⏱️ {formatCountdown(timeRemaining)}
            </span>
          )}
        </div>
      </div>

      <div className="exam-content">
        <div className="question-container">
          <h3>Question {currentQuestionIndex + 1}</h3>
          <p className="question-prompt">{currentQuestion.prompt}</p>

          {currentQuestion.imageData && (
            <div className="question-image">
              <img src={currentQuestion.imageData} alt="Question" />
            </div>
          )}

          <div className="options-container">
            {currentQuestion.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleAnswerQuestion(option.id)}
                className={`option-button ${currentAnswer === option.id ? 'selected' : ''}`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <div className="exam-actions">
          <button
            onClick={handleFlagQuestion}
            className={`btn ${isFlagged ? 'btn-warning' : 'btn-secondary'} btn-small`}
          >
            {isFlagged ? '🚩 Flagged' : '🚩 Flag'}
          </button>
        </div>
      </div>

      <div className="exam-navigation">
        <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="btn btn-secondary">
          ← Previous
        </button>

        <button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1} className="btn btn-secondary">
          Next →
        </button>

        <button onClick={handleSubmitExam} className="btn btn-danger">
          Submit Exam
        </button>
      </div>

      {autoSubmitted && <div className="notification">Exam auto-submitted due to time limit</div>}
    </div>
  )
}
