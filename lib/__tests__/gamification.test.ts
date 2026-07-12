import { describe, it, expect } from 'vitest'
import { calculateXp, levelFromXp, LEVEL_NAMES } from '../gamification'

describe('calculateXp', () => {
  it('returns base reward for basic pass', () => {
    expect(calculateXp({ base: 100, firstAttempt: false, underSixtySeconds: false, noHintUsed: false })).toBe(100)
  })

  it('adds 50% for first attempt', () => {
    expect(calculateXp({ base: 100, firstAttempt: true, underSixtySeconds: false, noHintUsed: false })).toBe(150)
  })

  it('adds 25% for speed bonus', () => {
    expect(calculateXp({ base: 100, firstAttempt: false, underSixtySeconds: true, noHintUsed: false })).toBe(125)
  })

  it('adds 10% for no hint used', () => {
    expect(calculateXp({ base: 100, firstAttempt: false, underSixtySeconds: false, noHintUsed: true })).toBe(110)
  })

  it('stacks all bonuses', () => {
    expect(calculateXp({ base: 100, firstAttempt: true, underSixtySeconds: true, noHintUsed: true })).toBe(185)
  })

  it('returns integer (floors result)', () => {
    expect(Number.isInteger(calculateXp({ base: 50, firstAttempt: true, underSixtySeconds: false, noHintUsed: false }))).toBe(true)
  })
})

describe('levelFromXp', () => {
  it('level 1 at 0 XP', () => expect(levelFromXp(0)).toBe(1))
  it('level 2 at 500 XP', () => expect(levelFromXp(500)).toBe(2))
  it('level 2 just below 1500', () => expect(levelFromXp(1499)).toBe(2))
  it('level 3 at 1500 XP', () => expect(levelFromXp(1500)).toBe(3))
  it('level 6 at 15000 XP', () => expect(levelFromXp(15000)).toBe(6))
  it('level 6 beyond max threshold', () => expect(levelFromXp(99999)).toBe(6))
})
