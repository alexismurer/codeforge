import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LeaderboardClient } from './LeaderboardClient'

export default async function LeaderboardPage() {
  const { userId } = await auth()
  const admin = createAdminClient()

  const { data: allTime } = await admin
    .from('users')
    .select('id, username, xp, level, streak')
    .order('xp', { ascending: false })
    .limit(20)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const { data: weeklyRaw } = await admin
    .from('submissions')
    .select('user_id, xp_earned, users(id, username, level)')
    .eq('passed', true)
    .gte('created_at', weekStart.toISOString())

  const weeklyMap: Record<string, { user_id: string; username: string; level: number; xp: number }> = {}
  for (const row of weeklyRaw ?? []) {
    const u = row.users as { id: string; username: string; level: number } | null
    if (!u) continue
    if (!weeklyMap[u.id]) weeklyMap[u.id] = { user_id: u.id, username: u.username, level: u.level, xp: 0 }
    weeklyMap[u.id].xp += row.xp_earned
  }
  const weekly = Object.values(weeklyMap)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 20)

  return (
    <LeaderboardClient
      initialAllTime={allTime ?? []}
      initialWeekly={weekly}
      currentUserId={userId ?? null}
    />
  )
}
