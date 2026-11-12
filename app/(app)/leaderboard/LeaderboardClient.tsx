'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LEVEL_NAMES } from '@/lib/gamification'
import { CountUp } from '@/components/motion/CountUp'
import { Reveal } from '@/components/motion/Reveal'

type LeaderboardEntry = {
  id?: string
  user_id?: string
  username: string
  xp: number
  level: number
  streak?: number
}

type Props = {
  initialAllTime: LeaderboardEntry[]
  initialWeekly: LeaderboardEntry[]
  currentUserId: string | null
}

const RANK_EDGE = ['bg-molten', 'bg-ember', 'bg-ember/50']

export function LeaderboardClient({ initialAllTime, initialWeekly, currentUserId }: Props) {
  const [tab, setTab] = useState<'alltime' | 'weekly'>('alltime')
  const [allTime, setAllTime] = useState(initialAllTime)

  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        () => {
          supabase
            .from('users')
            .select('id, username, xp, level, streak')
            .order('xp', { ascending: false })
            .limit(20)
            .then(({ data }) => {
              if (data) setAllTime(data)
            })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const rows = tab === 'alltime' ? allTime : initialWeekly

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">{'// Hall of heat'}</span>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">Leaderboard</h1>
        </div>
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="live-dot size-1.5 rounded-full bg-ember" />
          Live
        </span>
      </div>

      <div role="tablist" className="flex w-fit rounded-md border border-border bg-card p-0.5">
        {(['alltime', 'weekly'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`relative rounded-[4px] px-4 py-1.5 text-[13px] font-medium transition-colors ${
              tab === t ? 'bg-surface-2 text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'alltime' ? 'All time' : 'This week'}
            {tab === t && <span className="absolute inset-x-4 -bottom-px h-[2px] rounded-full bg-ember" />}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center gap-4 border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          <span className="w-8">Rank</span>
          <span className="flex-1">Player</span>
          <span>XP</span>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-12 text-center font-mono text-[12px] text-faint">No one has struck the anvil yet.</p>
        ) : (
          <Reveal key={tab} stagger={0.03} y={8}>
            {rows.map((entry, idx) => {
              const entryId = entry.id ?? entry.user_id
              const isCurrentUser = entryId === currentUserId
              return (
                <div
                  key={entryId ?? idx}
                  className={`relative flex items-center gap-4 border-b border-border px-4 py-3 transition-colors last:border-b-0 ${
                    isCurrentUser ? 'bg-ember/[0.08]' : 'hover:bg-surface-2/50'
                  }`}
                >
                  {idx < 3 && <span aria-hidden className={`absolute inset-y-0 left-0 w-[2px] ${RANK_EDGE[idx]}`} />}
                  <span
                    className={`w-8 font-mono text-[13px] tabular-nums ${
                      idx === 0 ? 'text-molten' : idx < 3 ? 'text-ember' : 'text-faint'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {entry.username}
                      {isCurrentUser && (
                        <span className="ml-2 rounded-[3px] border border-ember/40 px-1 py-px font-mono text-[9px] uppercase tracking-wider text-ember">you</span>
                      )}
                    </span>
                    <span className="font-mono text-[10.5px] text-faint">{LEVEL_NAMES[(entry.level ?? 1) - 1]}</span>
                  </div>
                  <span className={`font-mono text-sm ${idx === 0 ? 'text-molten' : 'text-foreground'}`}>
                    <CountUp value={entry.xp} />
                  </span>
                </div>
              )
            })}
          </Reveal>
        )}
      </div>
    </div>
  )
}
