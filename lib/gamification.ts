export const LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7500, 15000]
export const LEVEL_NAMES = ['Novice', 'Apprentice', 'Developer', 'Senior', 'Architect', 'Legend']

type XpParams = {
  base: number
  firstAttempt: boolean
  underSixtySeconds: boolean
  noHintUsed: boolean
}

export function calculateXp(params: XpParams): number {
  let multiplier = 1
  if (params.firstAttempt) multiplier += 0.5
  if (params.underSixtySeconds) multiplier += 0.25
  if (params.noHintUsed) multiplier += 0.1
  return Math.floor(params.base * multiplier)
}

export function levelFromXp(xp: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}
