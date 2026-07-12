import { describe, it, expect } from 'vitest'
import { computeWeaknessScores, pickRecommendations } from '../recommendations'
import type { Challenge } from '../types'

const makeChallenge = (overrides: Partial<Challenge>): Challenge => ({
  id: 'c1',
  slug: 'test',
  title: 'Test',
  description: '',
  topic: 'js',
  type: 'implement',
  difficulty: 2,
  starter_code: '',
  test_suite: '',
  solution: '',
  ai_context: '',
  xp_reward: 100,
  tags: [],
  order_index: 1,
  created_at: '',
  ...overrides,
})

describe('computeWeaknessScores', () => {
  it('returns 1.0 for topic with 0 attempts', () => {
    const scores = computeWeaknessScores({ js: 0, ts: 0, react: 0 }, { js: 0, ts: 0, react: 0 })
    expect(scores.js).toBe(1)
  })

  it('returns 0 for topic with 100% pass rate', () => {
    const scores = computeWeaknessScores({ js: 5, ts: 0, react: 0 }, { js: 5, ts: 0, react: 0 })
    expect(scores.js).toBe(0)
  })

  it('returns 0.4 for 3 attempted, 1 passed', () => {
    const scores = computeWeaknessScores({ js: 3, ts: 0, react: 0 }, { js: 1, ts: 0, react: 0 })
    expect(scores.js).toBeCloseTo(1 - 1 / 3)
  })
})

describe('pickRecommendations', () => {
  it('returns up to 3 challenges', () => {
    const challenges = [
      makeChallenge({ id: '1', topic: 'js', difficulty: 2 }),
      makeChallenge({ id: '2', topic: 'ts', difficulty: 3 }),
      makeChallenge({ id: '3', topic: 'react', difficulty: 2 }),
      makeChallenge({ id: '4', topic: 'js', difficulty: 2 }),
    ]
    const solvedIds = new Set<string>()
    const weaknessScores = { js: 1, ts: 1, react: 1 }
    const recs = pickRecommendations(challenges, solvedIds, weaknessScores, 2)
    expect(recs.length).toBeLessThanOrEqual(3)
  })

  it('excludes already solved challenges', () => {
    const c = makeChallenge({ id: '1', topic: 'js', difficulty: 2 })
    const solvedIds = new Set(['1'])
    const recs = pickRecommendations([c], solvedIds, { js: 1, ts: 0, react: 0 }, 2)
    expect(recs).toHaveLength(0)
  })
})
