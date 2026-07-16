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
  currentLevel: 1,
  refactorFirstAttempts: 0,
  difficulty4Solved: 0,
  difficulty5FirstAttempt: 0,
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

  it('awards grinder at 25 total solved', () => {
    expect(evaluateBadges({ ...base, totalSolved: 25 })).toContain('grinder')
  })

  it('does not award grinder below 25', () => {
    expect(evaluateBadges({ ...base, totalSolved: 24 })).not.toContain('grinder')
  })

  it('awards dedicated at 50 total solved', () => {
    expect(evaluateBadges({ ...base, totalSolved: 50 })).toContain('dedicated')
  })

  it('awards marathon at 14-day streak', () => {
    expect(evaluateBadges({ ...base, streak: 14 })).toContain('marathon')
  })

  it('awards js-master at 20 JS challenges', () => {
    expect(evaluateBadges({ ...base, topicCounts: { js: 20, ts: 0, react: 0 } })).toContain('js-master')
  })

  it('awards react-master at 20 React challenges', () => {
    expect(evaluateBadges({ ...base, topicCounts: { js: 0, ts: 0, react: 20 } })).toContain('react-master')
  })

  it('awards full-stack when all 3 topics have at least 1 solve', () => {
    expect(evaluateBadges({ ...base, topicCounts: { js: 1, ts: 1, react: 1 } })).toContain('full-stack')
  })

  it('does not award full-stack when a topic is missing', () => {
    expect(evaluateBadges({ ...base, topicCounts: { js: 5, ts: 5, react: 0 } })).not.toContain('full-stack')
  })

  it('awards quiz-ace at 10 multiple-choice solved', () => {
    expect(evaluateBadges({ ...base, typeCounts: { 'multiple-choice': 10 } })).toContain('quiz-ace')
  })

  it('awards clean-coder at 5 refactor first attempts', () => {
    expect(evaluateBadges({ ...base, refactorFirstAttempts: 5 })).toContain('clean-coder')
  })

  it('awards hard-mode at 5 difficulty-4 solves', () => {
    expect(evaluateBadges({ ...base, difficulty4Solved: 5 })).toContain('hard-mode')
  })

  it('awards nightmare at 1 difficulty-5 first-attempt solve', () => {
    expect(evaluateBadges({ ...base, difficulty5FirstAttempt: 1 })).toContain('nightmare')
  })

  it('awards rising-star at level 3', () => {
    expect(evaluateBadges({ ...base, currentLevel: 3 })).toContain('rising-star')
  })

  it('awards elite at level 5', () => {
    expect(evaluateBadges({ ...base, currentLevel: 5 })).toContain('elite')
  })
})
