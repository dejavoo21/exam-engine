/**
 * IndexedDB initialization and management
 */

import { IDBPDatabase, openDB } from 'idb'
import { ExamSet, ExamResult, QuestionStats, AttemptRecord, ExamSession } from './types'

const DB_NAME = 'exam-engine-db'
const DB_VERSION = 1

export async function initializeDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // ExamSets store
      if (!db.objectStoreNames.contains('examSets')) {
        db.createObjectStore('examSets', { keyPath: 'id' })
      }

      // ExamSessions store
      if (!db.objectStoreNames.contains('examSessions')) {
        const sessionStore = db.createObjectStore('examSessions', { keyPath: 'id' })
        sessionStore.createIndex('examSetId', 'examSetId', { unique: false })
      }

      // ExamResults store
      if (!db.objectStoreNames.contains('examResults')) {
        const resultStore = db.createObjectStore('examResults', { keyPath: 'id' })
        resultStore.createIndex('examSetId', 'examSetId', { unique: false })
        resultStore.createIndex('timestamp', 'endTime', { unique: false })
      }

      // QuestionStats store
      if (!db.objectStoreNames.contains('questionStats')) {
        const statsStore = db.createObjectStore('questionStats', { keyPath: 'id' })
        statsStore.createIndex('examSetId', 'examSetId', { unique: false })
        statsStore.createIndex('questionId', 'questionId', { unique: false })
      }

      // AttemptRecords store (for trend analysis)
      if (!db.objectStoreNames.contains('attemptRecords')) {
        const attemptStore = db.createObjectStore('attemptRecords', { keyPath: 'id' })
        attemptStore.createIndex('examSetId', 'examSetId', { unique: false })
        attemptStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

let dbInstance: IDBPDatabase | null = null

export async function getDB(): Promise<IDBPDatabase> {
  if (!dbInstance) {
    dbInstance = await initializeDB()
  }
  return dbInstance
}

// ExamSet operations
export async function saveExamSet(examSet: ExamSet): Promise<void> {
  const db = await getDB()
  await db.put('examSets', examSet)
}

export async function getExamSet(id: string): Promise<ExamSet | undefined> {
  const db = await getDB()
  return db.get('examSets', id)
}

export async function getAllExamSets(): Promise<ExamSet[]> {
  const db = await getDB()
  return db.getAll('examSets')
}

export async function deleteExamSet(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('examSets', id)
}

// ExamSession operations
export async function saveExamSession(session: ExamSession): Promise<void> {
  const db = await getDB()
  const sessionData = {
    ...session,
    answers: Object.fromEntries(session.answers),
    flagged: Array.from(session.flagged)
  }
  await db.put('examSessions', sessionData)
}

export async function getExamSession(id: string): Promise<ExamSession | undefined> {
  const db = await getDB()
  const sessionData = await db.get('examSessions', id)
  if (!sessionData) return undefined
  
  return {
    ...sessionData,
    answers: new Map(Object.entries(sessionData.answers || {})),
    flagged: new Set(sessionData.flagged || [])
  }
}

export async function getExamSessionsByExamSet(examSetId: string): Promise<ExamSession[]> {
  const db = await getDB()
  const sessions = await db.getAllFromIndex('examSessions', 'examSetId', examSetId)
  return sessions.map(session => ({
    ...session,
    answers: new Map(Object.entries(session.answers || {})),
    flagged: new Set(session.flagged || [])
  }))
}

export async function deleteExamSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('examSessions', id)
}

// ExamResult operations
export async function saveExamResult(result: ExamResult): Promise<void> {
  const db = await getDB()
  await db.put('examResults', result)
}

export async function getExamResult(id: string): Promise<ExamResult | undefined> {
  const db = await getDB()
  return db.get('examResults', id)
}

export async function getExamResultsByExamSet(examSetId: string): Promise<ExamResult[]> {
  const db = await getDB()
  return db.getAllFromIndex('examResults', 'examSetId', examSetId)
}

export async function getLatestExamResults(examSetId: string, limit: number = 10): Promise<ExamResult[]> {
  const db = await getDB()
  const results = await db.getAllFromIndex('examResults', 'examSetId', examSetId)
  return results.sort((a, b) => b.endTime - a.endTime).slice(0, limit)
}

// QuestionStats operations
export async function saveQuestionStats(stats: QuestionStats): Promise<void> {
  const db = await getDB()
  const id = `${stats.examSetId}-${stats.questionId}`
  await db.put('questionStats', { ...stats, id })
}

export async function getQuestionStats(examSetId: string, questionId: string): Promise<QuestionStats | undefined> {
  const db = await getDB()
  const id = `${examSetId}-${questionId}`
  return db.get('questionStats', id)
}

export async function getQuestionStatsByExamSet(examSetId: string): Promise<QuestionStats[]> {
  const db = await getDB()
  return db.getAllFromIndex('questionStats', 'examSetId', examSetId)
}

// AttemptRecord operations
export async function saveAttemptRecord(record: AttemptRecord): Promise<void> {
  const db = await getDB()
  await db.put('attemptRecords', record)
}

export async function getAttemptRecordsByExamSet(examSetId: string): Promise<AttemptRecord[]> {
  const db = await getDB()
  return db.getAllFromIndex('attemptRecords', 'examSetId', examSetId)
}
