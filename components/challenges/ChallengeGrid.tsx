'use client'

import { useState } from 'react'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge, ChallengeProgress } from '@/lib/types'

type Props = {
  challenges: Challenge[]
  progressMap: Record<string, ChallengeProgress>
}

const BATCH = 30

export function ChallengeGrid({ challenges, progressMap }: Props) {
  const [visibleCount, setVisibleCount] = useState(BATCH)
  const visible = challenges.slice(0, visibleCount)
  const remaining = challenges.length - visibleCount

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            progress={progressMap[challenge.id]}
          />
        ))}
      </div>
      {remaining > 0 && (
        <button
          onClick={() => setVisibleCount((c) => c + BATCH)}
          className="self-center px-5 py-2 text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          Show {Math.min(BATCH, remaining)} more
        </button>
      )}
    </div>
  )
}
