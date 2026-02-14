import React, { useState, useEffect } from 'react'
import { ExamSet } from '../types'
import { getAnalyticsSummary, getWeakQuestions } from '../analytics'

interface AnalyticsPageProps {
  examSet: ExamSet
  onNavigate: (page: string) => void
}

export default function AnalyticsPage({ examSet, onNavigate }: AnalyticsPageProps) {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [weakQuestions, setWeakQuestions] = useState<any[]>([])

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analyticsSummary = await getAnalyticsSummary(examSet.id)
        setSummary(analyticsSummary)

        const weak = await getWeakQuestions(examSet.id, examSet.questions)
        setWeakQuestions(weak)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [examSet])

  if (loading) {
    return <div className="page">Loading analytics...</div>
  }

  if (!summary) {
    return (
      <div className="page analytics-page">
        <h2>Analytics for {examSet.name}</h2>
        <p>No attempts yet. Complete an exam to see analytics.</p>
        <button onClick={() => onNavigate('exam-list')} className="btn btn-primary">
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="page analytics-page">
      <h2>Analytics for {examSet.name}</h2>

      <div className="analytics-summary">
        <div className="stat-card">
          <h3>Total Attempts</h3>
          <p className="stat-value">{summary.totalAttempts}</p>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <p className="stat-value">{Math.round(summary.averageScore)}%</p>
        </div>
        <div className="stat-card">
          <h3>Best Score</h3>
          <p className="stat-value">{Math.round(summary.bestScore)}%</p>
        </div>
        <div className="stat-card">
          <h3>Worst Score</h3>
          <p className="stat-value">{Math.round(summary.worstScore)}%</p>
        </div>
      </div>

      <div className="analytics-section">
        <h3>Trend (Last 10 Attempts)</h3>
        <div className="trend-chart">
          {summary.trend.length === 0 ? (
            <p>No trend data available</p>
          ) : (
            <div className="trend-items">
              {summary.trend.map((item: any, idx: number) => (
                <div key={idx} className="trend-item">
                  <div className="trend-bar" style={{ height: `${item.score}%` }}></div>
                  <span>{Math.round(item.score)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {weakQuestions.length > 0 && (
        <div className="analytics-section">
          <h3>Weak Questions (Missed 2+ times)</h3>
          <div className="weak-questions-list">
            {weakQuestions.map((q, idx) => (
              <div key={idx} className="weak-question">
                <h4>Q{q.number}: {q.prompt.substring(0, 80)}...</h4>
                <p>{q.options.filter((o: any) => o.isCorrect)[0]?.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button onClick={() => onNavigate('exam-list')} className="btn btn-primary">
          Back
        </button>
      </div>
    </div>
  )
}
