import React, { useState } from 'react'
import { ExamSet } from '../types'
import { deleteExamSet, saveExamSet } from '../db'
import { encodeExamSetToURL, generateShareCode } from '../utils'

interface ExamListPageProps {
  examSets: ExamSet[]
  onNavigate: (page: string, examSet?: ExamSet) => void
  onUpdated: () => void
}

export default function ExamListPage({ examSets, onNavigate, onUpdated }: ExamListPageProps) {
  const [shareCode, setShareCode] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Delete this exam set?')) {
      await deleteExamSet(id)
      onUpdated()
    }
  }

  const handleShare = (examSet: ExamSet) => {
    const code = generateShareCode(examSet)
    setShareCode(code)
  }

  const handleCopyShareCode = () => {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode)
      alert('Share code copied to clipboard')
    }
  }

  const handleCopyShareLink = (examSet: ExamSet) => {
    const fragment = encodeExamSetToURL(examSet)
    const url = `${window.location.origin}${fragment}`
    navigator.clipboard.writeText(url)
    alert('Share link copied to clipboard')
  }

  return (
    <div className="page exam-list-page">
      <h2>My Exams</h2>

      {examSets.length === 0 ? (
        <div className="empty-state">
          <p>No exam sets yet. Import one to get started!</p>
          <button onClick={() => onNavigate('import')} className="btn btn-primary">
            Import Exam
          </button>
        </div>
      ) : (
        <div className="exam-list">
          {examSets.map(examSet => (
            <div key={examSet.id} className="exam-card">
              <h3>{examSet.name}</h3>
              {examSet.description && <p>{examSet.description}</p>}
              <p className="exam-meta">
                {examSet.questions.length} questions | {examSet.sourceFormat || 'unknown'} | Parser:{' '}
                {examSet.parserUsed || 'N/A'}
              </p>

              <div className="exam-actions">
                <button
                  onClick={() => onNavigate('exam-setup', examSet)}
                  className="btn btn-primary btn-small"
                >
                  Start Exam
                </button>
                <button
                  onClick={() => onNavigate('preview-editor', examSet)}
                  className="btn btn-secondary btn-small"
                >
                  Edit
                </button>
                <button
                  onClick={() => onNavigate('analytics', examSet)}
                  className="btn btn-info btn-small"
                >
                  Analytics
                </button>
                <button
                  onClick={() => onNavigate('practice', examSet)}
                  className="btn btn-warning btn-small"
                >
                  Practice
                </button>
                <button
                  onClick={() => handleShare(examSet)}
                  className="btn btn-success btn-small"
                >
                  Share
                </button>
                <button
                  onClick={() => handleCopyShareLink(examSet)}
                  className="btn btn-info btn-small"
                >
                  Link
                </button>
                <button
                  onClick={() => handleDelete(examSet.id)}
                  className="btn btn-danger btn-small"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {shareCode && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Share Code</h3>
            <textarea readOnly value={shareCode} rows={5} style={{ width: '100%' }} />
            <button onClick={handleCopyShareCode} className="btn btn-primary">
              Copy to Clipboard
            </button>
            <button onClick={() => setShareCode(null)} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
