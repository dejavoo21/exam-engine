import React, { useState, useEffect } from 'react'
import { getDB, getAllExamSets, getExamSet } from './db'
import { decodeExamSetFromURL, getShareLinkFromURL } from './utils'
import HomePage from './pages/HomePage'
import ExamListPage from './pages/ExamListPage'
import ImportPage from './pages/ImportPage'
import PreviewEditorPage from './pages/PreviewEditorPage'
import ExamSetupPage from './pages/ExamSetupPage'
import ExamModePage from './pages/ExamModePage'
import ResultsPage from './pages/ResultsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import PracticePage from './pages/PracticePage'
import { ExamSet, ExamSession, ExamResult } from './types'
import './App.css'

type PageType =
  | 'home'
  | 'exam-list'
  | 'import'
  | 'preview-editor'
  | 'exam-setup'
  | 'exam-mode'
  | 'results'
  | 'analytics'
  | 'practice'

interface AppState {
  currentPage: PageType
  examSets: ExamSet[]
  currentExamSet?: ExamSet
  currentSession?: ExamSession
  currentResult?: ExamResult
}

export default function App() {
  const [state, setState] = useState<AppState>({
    currentPage: 'home',
    examSets: []
  })

  const [loading, setLoading] = useState(true)

  // Initialize DB and load exam sets
  useEffect(() => {
    const initialize = async () => {
      try {
        await getDB()
        const examSets = await getAllExamSets()
        setState(prev => ({ ...prev, examSets }))

        // Check for share link
        const shareLink = getShareLinkFromURL()
        if (shareLink) {
          const importedExamSet = decodeExamSetFromURL(window.location.hash)
          if (importedExamSet) {
            // Prompt user to import
            if (confirm(`Import exam: "${importedExamSet.name}"?`)) {
              setState(prev => ({
                ...prev,
                currentPage: 'preview-editor',
                currentExamSet: importedExamSet
              }))
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const navigateTo = (page: PageType, examSet?: ExamSet, session?: ExamSession, result?: ExamResult) => {
    setState({
      currentPage: page,
      examSets: state.examSets,
      currentExamSet: examSet || state.currentExamSet,
      currentSession: session || state.currentSession,
      currentResult: result || state.currentResult
    })
  }

  const handleExamSetsUpdated = async () => {
    const examSets = await getAllExamSets()
    setState(prev => ({ ...prev, examSets }))
  }

  if (loading) {
    return <div className="app-loading">Loading...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => navigateTo('home')}>Exam Engine</h1>
      </header>

      <main className="app-main">
        {state.currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
        {state.currentPage === 'exam-list' && (
          <ExamListPage examSets={state.examSets} onNavigate={navigateTo} onUpdated={handleExamSetsUpdated} />
        )}
        {state.currentPage === 'import' && <ImportPage onNavigate={navigateTo} onUpdated={handleExamSetsUpdated} />}
        {state.currentPage === 'preview-editor' && state.currentExamSet && (
          <PreviewEditorPage
            examSet={state.currentExamSet}
            onNavigate={navigateTo}
            onUpdated={handleExamSetsUpdated}
          />
        )}
        {state.currentPage === 'exam-setup' && state.currentExamSet && (
          <ExamSetupPage examSet={state.currentExamSet} onNavigate={navigateTo} />
        )}
        {state.currentPage === 'exam-mode' && state.currentExamSet && state.currentSession && (
          <ExamModePage
            examSet={state.currentExamSet}
            session={state.currentSession}
            onNavigate={navigateTo}
            onSessionUpdate={(session: ExamSession) => setState(prev => ({ ...prev, currentSession: session }))}
          />
        )}
        {state.currentPage === 'results' && state.currentResult && (
          <ResultsPage result={state.currentResult} onNavigate={navigateTo} />
        )}
        {state.currentPage === 'analytics' && state.currentExamSet && (
          <AnalyticsPage examSet={state.currentExamSet} onNavigate={navigateTo} />
        )}
        {state.currentPage === 'practice' && state.currentExamSet && (
          <PracticePage examSet={state.currentExamSet} onNavigate={navigateTo} />
        )}
      </main>

      <footer className="app-footer">
        <p>Exam Engine &copy; 2026 | Offline-capable exam simulation</p>
      </footer>
    </div>
  )
}
