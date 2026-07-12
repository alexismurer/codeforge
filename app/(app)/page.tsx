import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { Lightning, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { XpBar } from '@/components/gamification/XpBar'
import { ActivityHeatmap } from '@/components/gamification/ActivityHeatmap'
import { BadgeShelf } from '@/components/gamification/BadgeShelf'
import { ChallengeCard } from '@/components/challenges/ChallengeCard'
import { getChallenges, getUserProgress } from '@/lib/challenges'
import { computeWeaknessScores, pickRecommendations } from '@/lib/recommendations'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const admin = createAdminClient()

  const [profile, challenges, progressList, badgesData, activityData] = await Promise.all([
    admin.from('users').select('username, xp, level, streak').eq('id', userId).single(),
    getChallenges(),
    getUserProgress(userId),
    admin.from('user_badges').select('badge_slug').eq('user_id', userId),
    admin.from('submissions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('passed', true)
      .gte('created_at', new Date(Date.now() - 84 * 86400000).toISOString()),
  ])

  const userData = profile.data
  if (!userData) redirect('/')

  const progressMap = Object.fromEntries(progressList.map((p) => [p.challenge_id, p]))
  const solvedIds = new Set(progressList.filter((p) => p.status === 'solved').map((p) => p.challenge_id))

  const activityByDate: Record<string, number> = {}
  for (const row of activityData.data ?? []) {
    const date = row.created_at.split('T')[0]
    activityByDate[date] = (activityByDate[date] ?? 0) + 1
  }
  const activity = Object.entries(activityByDate).map(([date, count]) => ({ date, count }))

  const topicAttempted: Record<string, number> = {}
  const topicPassed: Record<string, number> = {}
  let difficultySum = 0
  let solveCount = 0

  for (const p of progressList) {
    const c = challenges.find((ch) => ch.id === p.challenge_id)
    if (!c) continue
    topicAttempted[c.topic] = (topicAttempted[c.topic] ?? 0) + 1
    if (p.status === 'solved') {
      topicPassed[c.topic] = (topicPassed[c.topic] ?? 0) + 1
      difficultySum += c.difficulty
      solveCount++
    }
  }

  const avgDifficulty = solveCount > 0 ? difficultySum / solveCount : 2
  const weaknessScores = computeWeaknessScores(topicAttempted, topicPassed)
  const recommended = pickRecommendations(challenges, solvedIds, weaknessScores, avgDifficulty)

  const earnedBadgeSlugs = (badgesData.data ?? []).map((b) => b.badge_slug)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-zinc-100">
          Welcome back, {userData.username}
        </h1>
        <XpBar xp={userData.xp} level={userData.level} />
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Lightning size={13} weight="fill" className="text-amber-400" />
          <span>{userData.xp.toLocaleString()} total XP</span>
          <span>·</span>
          <span>{solvedIds.size} challenges solved</span>
          <span>·</span>
          <span>🔥 {userData.streak} day streak</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-200 text-sm">Recommended for you</h2>
          <Link
            href="/challenges"
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            Browse all <ArrowRight size={12} />
          </Link>
        </div>
        {recommended.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            You&apos;ve solved everything! More challenges coming soon.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recommended.map((c) => (
              <ChallengeCard key={c.id} challenge={c} progress={progressMap[c.id]} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-zinc-200 text-sm">Activity</h2>
        <ActivityHeatmap activity={activity} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-200 text-sm">
            Badges ({earnedBadgeSlugs.length}/12)
          </h2>
        </div>
        <BadgeShelf earnedSlugs={earnedBadgeSlugs} />
      </div>
    </div>
  )
}
