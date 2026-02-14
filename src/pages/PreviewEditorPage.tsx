import React, { useState } from 'react'
import { ExamSet, Question } from '../types'
import { saveExamSet } from '../db'

interface PreviewEditorPageProps {
  examSet: ExamSet
  onNavigate: (page: string, examSet?: ExamSet) => void
  onUpdated: () => void
}

export default function PreviewEditorPage({ examSet, onNavigate, onUpdated }: PreviewEditorPageProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [questions, setQuestions] = useState<Question[]>(examSet.questions)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    const newQuestions = questions.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q))
    setQuestions(newQuestions)
    setEditingQuestion(null)
    setUnsavedChanges(true)
  }

  const handleDeleteQuestion = (questionId: string) => {
    const newQuestions = questions.filter(q => q.id !== questionId)
    setQuestions(newQuestions)
    setUnsavedChanges(true)
  }

  const handleSave = async () => {
    const updatedExamSet = {
      ...examSet,
      questions,
      updatedAt: Date.now()
    }
    await saveExamSet(updatedExamSet)
    onUpdated()
    setUnsavedChanges(false)
    alert('Changes saved!')
  }

  return (
    <div className="page preview-editor-page">
      <h2>{examSet.name} - Preview & Edit</h2>

      {unsavedChanges && (
        <div className="unsaved-warning">
          <p>You have unsaved changes</p>
          <button onClick={handleSave} className="btn btn-primary">
            Save Changes
          </button>
        </div>
      )}

      <div className="question-list">
        {questions.map((question, idx) => (
          <div key={question.id} className="question-item">
            <div className="question-header">
              <h4>Q{idx + 1}: {question.prompt.substring(0, 60)}...</h4>
              <button
                onClick={() => setEditingQuestion(question)}
                className="btn btn-secondary btn-small"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteQuestion(question.id)}
                className="btn btn-danger btn-small"
              >
                Delete
              </button>
            </div>
            <div className="question-options">
              {question.options.map((opt, i) => (
                <div key={i} className={`option ${opt.isCorrect ? 'correct' : ''}`}>
                  {opt.text} {opt.isCorrect && '✓'}
                </div>
              ))}
            </div>
            {question.imageData && <div className="question-image">📷 Has image</div>}
          </div>
        ))}
      </div>

      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          onSave={handleUpdateQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  )
}

interface QuestionEditorProps {
  question: Question
  onSave: (question: Question) => void
  onCancel: () => void
}

function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [prompt, setPrompt] = useState(question.prompt)
  const [options, setOptions] = useState(question.options)
  const [explanation, setExplanation] = useState(question.explanation || '')
  const [imageData, setImageData] = useState(question.imageData || '')

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index].text = text
    setOptions(newOptions)
  }

  const handleSetCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }))
    setOptions(newOptions)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageData(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave({
      ...question,
      prompt,
      options,
      explanation: explanation || undefined,
      imageData: imageData || undefined,
      updatedAt: Date.now()
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal question-editor">
        <h3>Edit Question</h3>

        <div className="form-group">
          <label>Question Prompt:</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} />
        </div>

        <div className="form-group">
          <label>Options:</label>
          {options.map((opt, i) => (
            <div key={i} className="option-editor">
              <input
                type="text"
                value={opt.text}
                onChange={e => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(97 + i)}`}
              />
              <button
                onClick={() => handleSetCorrect(i)}
                className={`btn ${opt.isCorrect ? 'btn-success' : 'btn-secondary'} btn-small`}
              >
                {opt.isCorrect ? 'Correct ✓' : 'Set as correct'}
              </button>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Explanation:</label>
          <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={3} />
        </div>

        <div className="form-group">
          <label>Image (optional):</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imageData && <img src={imageData} alt="Question" style={{ maxWidth: '200px', marginTop: '10px' }} />}
        </div>

        <div className="form-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
