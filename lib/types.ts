export type Topic = 'js' | 'ts' | 'react'
export type ChallengeType = 'implement' | 'fix-bug' | 'refactor' | 'multiple-choice'
export type ProgressStatus = 'attempted' | 'solved'

export type Challenge = {
  id: string
  slug: string
  title: string
  description: string
  topic: Topic
  type: ChallengeType
  difficulty: number      // 1–5
  starter_code: string
  test_suite: string
  solution: string
  ai_context: string
  xp_reward: number
  tags: string[]
  order_index: number
  created_at: string
}

export type ChallengeProgress = {
  challenge_id: string
  status: ProgressStatus
  best_time: number | null
  attempts: number
}

export type TestResult = {
  name: string
  passed: boolean
  error?: string
}

export type RunResult = {
  results: TestResult[]
  passed: boolean   // true only if ALL tests pass
  totalMs: number
}
