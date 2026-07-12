import type { Challenge, Topic } from './types'

type TopicCounts = Record<string, number>

export function computeWeaknessScores(
  attempted: TopicCounts,
  passed: TopicCounts
): Record<string, number> {
  const topics: Topic[] = ['js', 'ts', 'react']
  const scores: Record<string, number> = {}

  for (const topic of topics) {
    const a = attempted[topic] ?? 0
    const p = passed[topic] ?? 0
    scores[topic] = a === 0 ? 1 : 1 - p / a
  }

  return scores
}

export function pickRecommendations(
  allChallenges: Challenge[],
  solvedIds: Set<string>,
  weaknessScores: Record<string, number>,
  averageDifficulty: number
): Challenge[] {
  const unsolved = allChallenges.filter((c) => !solvedIds.has(c.id))

  const scored = unsolved.map((c) => {
    const weaknessWeight = weaknessScores[c.topic] ?? 0.5
    const difficultyDistance = Math.abs(c.difficulty - averageDifficulty)
    const difficultyWeight = 1 / (1 + difficultyDistance)
    return { challenge: c, score: weaknessWeight * 0.7 + difficultyWeight * 0.3 }
  })

  scored.sort((a, b) => b.score - a.score)

  const picks: Challenge[] = []
  for (const { challenge } of scored) {
    if (picks.length >= 3) break
    picks.push(challenge)
  }

  return picks
}
