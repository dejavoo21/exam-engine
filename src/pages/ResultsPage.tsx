import React, { useState } from 'react'
import { ExamResult, Question } from '../types'
import { formatPercentage } from '../utils'

interface ResultsPageProps {
  result: ExamResult
  onNavigate: (page: string) => void
}

export default function ResultsPage({ result, onNavigate }: ResultsPageProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleExpanded = (questionId: string) => {
    const newSet = new Set(expandedQuestions)
    if (newSet.has(questionId)) {
      newSet.delete(questionId)
    } else {
      newSet.add(questionId)
    }
    setExpandedQuestions(newSet)
  }

  return (
    <div className="page results-page">
      <h2>Exam Results</h2>

      <div className="results-summary">
        <div className="score-card">
          <h3>Your Score</h3>
          <div className="score-display">
            <div className="score-number">{result.score}/{result.totalQuestions}</div>
            <div className="score-percentage">{formatPercentage(result.percentage)}</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <label>Duration</label>
            <p>{result.duration} minutes</p>
          </div>
          <div className="stat-card">
            <label>Flagged</label>
            <p>{result.flagged.length}</p>
          </div>
        </div>
      </div>

      <div className="breakdown-section">
        <h3>Breakdown by Question Type</h3>
        <div className="breakdown-grid">
          {Object.entries(result.byType).map(([type, stats]) => (
            <div key={type} className="breakdown-card">
              <h4>{type}</h4>
              <p>
                {stats.correct}/{stats.total} correct ({Math.round((stats.correct / stats.total) * 100)}%)
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="breakdown-section">
        <h3>Breakdown by Image</h3>
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <h4>With Image</h4>
            <p>
              {result.byImage.withImage.correct}/{result.byImage.withImage.total} correct (
              {result.byImage.withImage.total > 0
                ? Math.round((result.byImage.withImage.correct / result.byImage.withImage.total) * 100)
                : 0}
              %)
            </p>
          </div>
          <div className="breakdown-card">
            <h4>Without Image</h4>
            <p>
              {result.byImage.withoutImage.correct}/{result.byImage.withoutImage.total} correct (
              {result.byImage.withoutImage.total > 0
                ? Math.round((result.byImage.withoutImage.correct / result.byImage.withoutImage.total) * 100)
                : 0}
              %)
            </p>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button onClick={() => onNavigate('exam-list')} className="btn btn-primary">
          Back to My Exams
        </button>
      </div>
    </div>
  )
}
