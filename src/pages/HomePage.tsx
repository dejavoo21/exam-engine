import React from 'react'

interface HomePageProps {
  onNavigate: (page: string) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="page home-page">
      <div className="page-content">
        <h2>Welcome to Exam Engine</h2>
        <p>Offline-capable exam simulation platform. Study anywhere, anytime.</p>

        <div className="action-buttons">
          <button onClick={() => onNavigate('exam-list')} className="btn btn-primary">
            My Exams
          </button>
          <button onClick={() => onNavigate('import')} className="btn btn-secondary">
            Import New Exam
          </button>
        </div>

        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>📚 Support multiple exam formats (PDF, DOCX, TXT)</li>
            <li>🖼️ Extract and attach images from documents</li>
            <li>⏱️ Timed and untimed practice modes</li>
            <li>📊 Analytics and spaced repetition</li>
            <li>🔗 Share exams via URL without downloads</li>
            <li>📱 Fully offline - works without internet</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
