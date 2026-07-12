'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateXp, levelFromXp } from '@/lib/gamification'
import { evaluateBadges, type BadgeContext } from '@/lib/badges'

type SubmitParams = {
  challengeId: string
  code: string
  passed: boolean
  timeToSolveSeconds: number
  aiHintUsed: boolean
  challengeXpReward: number
  challengeTopic: string
  challengeType: string
  challengeTags: string[]
  challengeDifficulty: number
}

export type SubmitResult = {
  xpEarned: number
  newBadges: string[]
  newLevel: number | null
  streakUpdated: boolean
}

export async function recordSubmission(params: SubmitParams): Promise<SubmitResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('users')
    .select('xp, level, streak, last_solved')
    .eq('id', userId)
    .single()

  if (!profile) throw new Error('User profile not found')

  const { count: prevAttempts } = await admin
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('challenge_id', params.challengeId)

  const attemptNumber = (prevAttempts ?? 0) + 1
  const isFirstAttempt = attemptNumber === 1

  const xpEarned = params.passed
    ? calculateXp({
        base: params.challengeXpReward,
        firstAttempt: isFirstAttempt,
        underSixtySeconds: params.timeToSolveSeconds < 60,
        noHintUsed: !params.aiHintUsed,
      })
    : 0

  await admin.from('submissions').insert({
    user_id: userId,
    challenge_id: params.challengeId,
    code: params.code,
    passed: params.passed,
    attempt_number: attemptNumber,
    time_to_solve: params.passed ? params.timeToSolveSeconds : null,
    ai_hint_used: params.aiHintUsed,
    xp_earned: xpEarned,
  })

  const progressStatus = params.passed ? 'solved' : 'attempted'
  await admin.from('challenge_progress').upsert({
    user_id: userId,
    challenge_id: params.challengeId,
    status: progressStatus,
    best_time: params.passed ? params.timeToSolveSeconds : undefined,
    attempts: attemptNumber,
  }, { onConflict: 'user_id,challenge_id' })

  if (!params.passed) {
    return { xpEarned: 0, newBadges: [], newLevel: null, streakUpdated: false }
  }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const lastSolved = profile.last_solved

  let newStreak = profile.streak
  let streakUpdated = false

  if (lastSolved !== today) {
    newStreak = lastSolved === yesterday ? profile.streak + 1 : 1
    streakUpdated = true
  }

  const { data: progressRows } = await admin
    .from('challenge_progress')
    .select('challenge_id, status')
    .eq('user_id', userId)
    .eq('status', 'solved')

  const { data: challenges } = await admin
    .from('challenges')
    .select('id, topic, type, tags, difficulty')

  const { data: earnedBadges } = await admin
    .from('user_badges')
    .select('badge_slug')
    .eq('user_id', userId)

  const solvedIds = new Set((progressRows ?? []).map((p) => p.challenge_id))
  const solvedChallenges = (challenges ?? []).filter((c) => solvedIds.has(c.id))

  const topicCounts: Record<string, number> = {}
  const typeCounts: Record<string, number> = {}
  const tagCounts: Record<string, number> = {}
  let maxDifficulty = 0

  for (const c of solvedChallenges) {
    topicCounts[c.topic] = (topicCounts[c.topic] ?? 0) + 1
    typeCounts[c.type] = (typeCounts[c.type] ?? 0) + 1
    for (const tag of c.tags ?? []) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
    }
    if (c.difficulty > maxDifficulty) maxDifficulty = c.difficulty
  }

  const { data: noHintRows } = await admin
    .from('submissions')
    .select('id')
    .eq('user_id', userId)
    .eq('passed', true)
    .eq('ai_hint_used', false)

  const noHintSolves = noHintRows?.length ?? 0

  const badgeCtx: BadgeContext = {
    totalSolved: solvedIds.size,
    streak: newStreak,
    solveTimeSeconds: params.timeToSolveSeconds,
    isFirstAttempt,
    consecutiveFirstAttempts: 0,
    topicCounts,
    typeCounts,
    tagCounts,
    noHintSolves,
    maxDifficultySolved: maxDifficulty,
    alreadyEarned: (earnedBadges ?? []).map((b) => b.badge_slug),
  }

  const newBadges = evaluateBadges(badgeCtx)

  if (newBadges.length > 0) {
    await admin.from('user_badges').insert(
      newBadges.map((slug) => ({ user_id: userId, badge_slug: slug }))
    )
  }

  const newXp = profile.xp + xpEarned
  const newLevel = levelFromXp(newXp)
  const levelledUp = newLevel > profile.level

  await admin.from('users').update({
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    last_solved: today,
  }).eq('id', userId)

  return {
    xpEarned,
    newBadges,
    newLevel: levelledUp ? newLevel : null,
    streakUpdated,
  }
}
