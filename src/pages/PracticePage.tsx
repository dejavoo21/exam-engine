import React, { useState, useEffect } from 'react'
import { ExamSet } from '../types'
import { getSpacedRepetitionQuestions } from '../analytics'

interface PracticePageProps {
  examSet: ExamSet
  onNavigate: (page: string) => void
}

export default function PracticePage({ examSet, onNavigate }: PracticePageProps) {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string>>(new Map())
  const [showResults, setShowResults] = useState(false)

  const [filters, setFilters] = useState({
    onlyWrong: false,
    onlyFlagged: false,
    onlyImageQuestions: false,
    types: [] as string[]
  })

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const spaced = await getSpacedRepetitionQuestions(
          examSet.id,
          examSet.questions,
          10,
          filters.onlyWrong || filters.onlyFlagged || filters.onlyImageQuestions || filters.types.length > 0
            ? filters
            : undefined
        )
        setQuestions(spaced)
      } catch (error) {
        console.error('Failed to load questions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [examSet, filters])

  if (loading) {
    return <div className="page">Loading practice questions...</div>
  }

  if (questions.length === 0) {
    return (
      <div className="page practice-page">
        <h2>Spaced Repetition Practice</h2>
        <p>No questions matching your criteria</p>
        <button onClick={() => onNavigate('exam-list')} className="btn btn-primary">
          Back
        </button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.get(currentQuestion.id)

  const handleAnswer = (optionId: string) => {
    const newAnswers = new Map(answers)
    newAnswers.set(currentQuestion.id, optionId)
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    let correct = 0
    for (const question of questions) {
      const userAnswer = answers.get(question.id)
      const correctOption = question.options.find((o: any) => o.isCorrect)
      if (userAnswer === correctOption?.id) {
        correct++
      }
    }
    return { correct, total: questions.length }
  }

  if (showResults) {
    const { correct, total } = calculateScore()
    return (
      <div className="page practice-page">
        <h2>Practice Results</h2>
        <div className="results-summary">
          <h3>{correct}/{total} Correct ({Math.round((correct / total) * 100)}%)</h3>
        </div>
        <button onClick={() => onNavigate('exam-list')} className="btn btn-primary">
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="page practice-page">
      <h2>Spaced Repetition Practice - {currentIndex + 1}/{questions.length}</h2>

      <div className="practice-question">
        <h3>Question {currentIndex + 1}</h3>
        <p className="question-prompt">{currentQuestion.prompt}</p>

        {currentQuestion.imageData && (
          <div className="question-image">
            <img src={currentQuestion.imageData} alt="Question" />
          </div>
        )}

        <div className="options-container">
          {currentQuestion.options.map((option: any) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className={`option-button ${currentAnswer === option.id ? 'selected' : ''}`}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button onClick={() => onNavigate('exam-list')} className="btn btn-secondary">
          Exit Practice
        </button>
        <button onClick={handleNext} className="btn btn-primary">
          {currentIndex === questions.length - 1 ? 'See Results' : 'Next'}
        </button>
      </div>
    </div>
  )
}
