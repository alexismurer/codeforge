import { notFound } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ActivityHeatmap } from '@/components/gamification/ActivityHeatmap'
import { BadgeShelf } from '@/components/gamification/BadgeShelf'
import { XpBar } from '@/components/gamification/XpBar'
import { Lightning, Fire, CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { CountUp } from '@/components/motion/CountUp'
import { Reveal } from '@/components/motion/Reveal'

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 bg-card px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</span>
      <span className="flex items-center gap-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">{children}</span>
    </div>
  )
}


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
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 pb-16 sm:px-6">
      <div className="relative -mx-4 h-[180px] overflow-hidden sm:-mx-6">
        <Image
          src="/images/profile-banner.png"
          alt=""
          fill
          priority
          style={{ objectFit: 'cover', opacity: 0.4, filter: 'grayscale(0.5) sepia(0.6) saturate(1.6) hue-rotate(-15deg)' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(80%_100%_at_50%_0%,oklch(0.70_0.19_45/18%),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      <Reveal className="-mt-24 flex flex-col gap-10">
        <div className="relative flex items-end gap-5">
          <div className="flex size-20 flex-shrink-0 items-center justify-center rounded-md border border-ember/50 bg-surface-2 font-display text-4xl font-semibold text-ember shadow-[0_0_40px_-8px_var(--ember)]">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col gap-1 pb-1">
            <span className="eyebrow">Member since {joinedYear}</span>
            <h1 className="truncate font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{profile.username}</h1>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border">
          <Stat label="XP">
            <Lightning size={18} weight="fill" className="text-molten" />
            <CountUp value={profile.xp} />
          </Stat>
          <Stat label="Streak">
            <Fire size={18} weight="fill" className={profile.streak > 0 ? 'text-ember' : 'text-faint'} />
            <CountUp value={profile.streak} />
            <span className="font-mono text-xs font-normal text-faint">days</span>
          </Stat>
          <Stat label="Solved">
            <CheckCircle size={18} weight="fill" className="text-ember" />
            <CountUp value={solvedCount} />
          </Stat>
        </div>

        <XpBar xp={profile.xp} level={profile.level} />

        <section className="flex flex-col gap-4">
          <h2 className="eyebrow">{'// Activity'}</h2>
          <ActivityHeatmap activity={activity} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="eyebrow">
            {'// Badges'} <span className="text-ember">{earnedSlugs.length}</span> / 12
          </h2>
          <BadgeShelf earnedSlugs={earnedSlugs} />
        </section>
      </Reveal>
    </div>
  )
}
