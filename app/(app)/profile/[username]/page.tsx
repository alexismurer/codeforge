import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ActivityHeatmap } from '@/components/gamification/ActivityHeatmap'
import { BadgeShelf } from '@/components/gamification/BadgeShelf'
import { XpBar } from '@/components/gamification/XpBar'
import { Lightning, Fire, CheckCircle } from '@phosphor-icons/react/dist/ssr'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const { userId: currentUserId } = await auth()
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('users')
    .select('id, username, xp, level, streak, created_at')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const [badgesData, progressData, activityData] = await Promise.all([
    admin.from('user_badges').select('badge_slug, awarded_at').eq('user_id', profile.id),
    admin.from('challenge_progress').select('status').eq('user_id', profile.id),
    admin.from('submissions')
      .select('created_at')
      .eq('user_id', profile.id)
      .eq('passed', true)
      .gte('created_at', new Date(Date.now() - 84 * 86400000).toISOString()),
  ])

  const earnedSlugs = (badgesData.data ?? []).map((b) => b.badge_slug)
  const solvedCount = (progressData.data ?? []).filter((p) => p.status === 'solved').length

  const activityByDate: Record<string, number> = {}
  for (const row of activityData.data ?? []) {
    const date = row.created_at.split('T')[0]
    activityByDate[date] = (activityByDate[date] ?? 0) + 1
  }
  const activity = Object.entries(activityByDate).map(([date, count]) => ({ date, count }))

  const joinedYear = new Date(profile.created_at).getFullYear()

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h1 className="text-xl font-bold text-zinc-100">{profile.username}</h1>
          <p className="text-zinc-500 text-sm">Member since {joinedYear}</p>
          <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Lightning size={13} weight="fill" />
              {profile.xp.toLocaleString()} XP
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <Fire size={13} weight="fill" />
              {profile.streak} day streak
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={13} weight="fill" />
              {solvedCount} solved
            </span>
          </div>
        </div>
      </div>

      <XpBar xp={profile.xp} level={profile.level} />

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-zinc-200 text-sm">Activity</h2>
        <ActivityHeatmap activity={activity} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-zinc-200 text-sm">
          Badges ({earnedSlugs.length} / 12)
        </h2>
        <BadgeShelf earnedSlugs={earnedSlugs} />
      </div>
    </div>
  )
}
