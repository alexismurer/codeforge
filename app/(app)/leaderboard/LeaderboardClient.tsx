'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { LEVEL_NAMES } from '@/lib/gamification'

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

const RANK_ICONS: Record<number, React.ReactNode> = {
  0: <Trophy size={14} weight="fill" className="text-amber-400" />,
  1: <Medal size={14} weight="fill" className="text-zinc-300" />,
  2: <Medal size={14} weight="fill" className="text-amber-700" />,
}

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
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">Leaderboard</h1>
        <p className="text-zinc-500 text-sm">Updated in real time</p>
      </div>

      <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg w-fit">
        {(['alltime', 'weekly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'alltime' ? 'All Time' : 'This Week'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((entry, idx) => {
          const entryId = entry.id ?? entry.user_id
          const isCurrentUser = entryId === currentUserId
          return (
            <div
              key={entryId ?? idx}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
                isCurrentUser
                  ? 'bg-indigo-950/40 border-indigo-800/50'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="w-6 flex items-center justify-center text-xs text-zinc-500 font-mono">
                {RANK_ICONS[idx] ?? <span>{idx + 1}</span>}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`font-medium text-sm ${isCurrentUser ? 'text-indigo-300' : 'text-zinc-200'}`}>
                  {entry.username}
                  {isCurrentUser && <span className="ml-2 text-[10px] text-indigo-500">you</span>}
                </span>
                <span className="text-[11px] text-zinc-500">{LEVEL_NAMES[(entry.level ?? 1) - 1]}</span>
              </div>
              <span className="text-amber-400 text-sm font-semibold tabular-nums">
                {entry.xp.toLocaleString()} XP
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
