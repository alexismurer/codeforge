import { describe, it, expect } from 'vitest'
import { evaluateBadges } from '../badges'
import type { BadgeContext } from '../badges'

const base: BadgeContext = {
  totalSolved: 0,
  streak: 0,
  solveTimeSeconds: null,
  isFirstAttempt: false,
  consecutiveFirstAttempts: 0,
  topicCounts: { js: 0, ts: 0, react: 0 },
  typeCounts: { implement: 0, 'fix-bug': 0, refactor: 0, 'multiple-choice': 0 },
  tagCounts: {},
  noHintSolves: 0,
  maxDifficultySolved: 0,
  alreadyEarned: [],
}

describe('evaluateBadges', () => {
  it('awards first-blood on first solve', () => {
    const ctx = { ...base, totalSolved: 1 }
    expect(evaluateBadges(ctx)).toContain('first-blood')
  })

  it('does not re-award already earned badge', () => {
    const ctx = { ...base, totalSolved: 1, alreadyEarned: ['first-blood'] }
    expect(evaluateBadges(ctx)).not.toContain('first-blood')
  })

  it('awards on-fire at streak 7', () => {
    const ctx = { ...base, streak: 7 }
    expect(evaluateBadges(ctx)).toContain('on-fire')
  })

  it('awards speed-demon when solve time <= 60s', () => {
    const ctx = { ...base, solveTimeSeconds: 45 }
    expect(evaluateBadges(ctx)).toContain('speed-demon')
  })

  it('does not award speed-demon when solve time > 60s', () => {
    const ctx = { ...base, solveTimeSeconds: 61 }
    expect(evaluateBadges(ctx)).not.toContain('speed-demon')
  })

  it('awards type-wizard at 10 TS solves', () => {
    const ctx = { ...base, topicCounts: { js: 0, ts: 10, react: 0 } }
    expect(evaluateBadges(ctx)).toContain('type-wizard')
  })
})
