import badgeDefinitions from '@/content/badges.json'

export type BadgeContext = {
  totalSolved: number
  streak: number
  solveTimeSeconds: number | null
  isFirstAttempt: boolean
  consecutiveFirstAttempts: number
  topicCounts: Record<string, number>
  typeCounts: Record<string, number>
  tagCounts: Record<string, number>
  noHintSolves: number
  maxDifficultySolved: number
  alreadyEarned: string[]
}

export function evaluateBadges(ctx: BadgeContext): string[] {
  const newBadges: string[] = []

  for (const badge of badgeDefinitions) {
    if (ctx.alreadyEarned.includes(badge.slug)) continue

    let earned = false

    switch (badge.condition) {
      case 'total_solved':
        earned = ctx.totalSolved >= badge.threshold
        break
      case 'streak':
        earned = ctx.streak >= badge.threshold
        break
      case 'single_solve_time':
        earned = ctx.solveTimeSeconds !== null && ctx.solveTimeSeconds <= badge.threshold
        break
      case 'consecutive_first_attempt':
        earned = ctx.consecutiveFirstAttempts >= badge.threshold
        break
      case 'no_hint_solved':
        earned = ctx.noHintSolves >= badge.threshold
        break
      case 'difficulty_solved':
        earned = ctx.maxDifficultySolved >= badge.threshold
        break
      default:
        if (badge.condition.startsWith('topic_solved_')) {
          const topic = badge.condition.replace('topic_solved_', '')
          earned = (ctx.topicCounts[topic] ?? 0) >= badge.threshold
        } else if (badge.condition.startsWith('type_solved_')) {
          const type = badge.condition.replace('type_solved_', '')
          earned = (ctx.typeCounts[type] ?? 0) >= badge.threshold
        } else if (badge.condition.startsWith('tag_solved_')) {
          const tag = badge.condition.replace('tag_solved_', '')
          earned = (ctx.tagCounts[tag] ?? 0) >= badge.threshold
        }
    }

    if (earned) newBadges.push(badge.slug)
  }

  return newBadges
}

export { badgeDefinitions }
