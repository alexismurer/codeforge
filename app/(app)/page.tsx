import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { Lightning, ArrowRight, Fire, CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { CountUp } from '@/components/motion/CountUp'
import { Reveal } from '@/components/motion/Reveal'
import { createAdminClient } from '@/lib/supabase/admin'
import { XpBar } from '@/components/gamification/XpBar'
import { ActivityHeatmap } from '@/components/gamification/ActivityHeatmap'
import { BadgeShelf } from '@/components/gamification/BadgeShelf'
import { ChallengeCard } from '@/components/challenges/ChallengeCard'
import { getChallenges, getUserProgress } from '@/lib/challenges'
import { computeWeaknessScores, pickRecommendations } from '@/lib/recommendations'

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 bg-card px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</span>
      <span className="flex items-center gap-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">{children}</span>
    </div>
  )
}

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
    <Reveal className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">{'// Dashboard'}</span>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
            Welcome back, <span className="ember-text">{userData.username}</span>
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border">
          <Stat label="Total XP">
            <Lightning size={18} weight="fill" className="text-molten" />
            <CountUp value={userData.xp} />
          </Stat>
          <Stat label="Solved">
            <CheckCircle size={18} weight="fill" className="text-ember" />
            <CountUp value={solvedIds.size} />
          </Stat>
          <Stat label="Streak">
            <Fire size={18} weight="fill" className={userData.streak > 0 ? 'text-ember' : 'text-faint'} />
            <CountUp value={userData.streak} />
            <span className="font-mono text-xs font-normal text-faint">days</span>
          </Stat>
        </div>
        <XpBar xp={userData.xp} level={userData.level} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="eyebrow">{'// Recommended for you'}</h2>
          <Link
            href="/challenges"
            className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-ember"
          >
            Browse all <ArrowRight size={12} />
          </Link>
        </div>
        {recommended.length === 0 ? (
          <p className="rounded-md border border-dashed border-border py-10 text-center font-mono text-[12px] text-muted-foreground">
            You&apos;ve solved everything. More challenges are on the anvil.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((c) => (
              <ChallengeCard key={c.id} challenge={c} progress={progressMap[c.id]} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="eyebrow">{'// Activity'}</h2>
        <ActivityHeatmap activity={activity} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="eyebrow">
          {'// Badges'} <span className="text-ember">{earnedBadgeSlugs.length}</span> / 12
        </h2>
        <BadgeShelf earnedSlugs={earnedBadgeSlugs} />
      </section>
    </Reveal>
  )
}
