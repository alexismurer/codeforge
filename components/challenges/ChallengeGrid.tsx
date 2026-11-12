'use client'

import { useState } from 'react'
import { ChallengeCard } from './ChallengeCard'
import { Reveal } from '@/components/motion/Reveal'
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
    <div className="flex flex-col gap-6">
      <Reveal
        key={challenges.map((c) => c.id).join()}
        stagger={0.025}
        y={12}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            progress={progressMap[challenge.id]}
          />
        ))}
      </Reveal>
      {remaining > 0 && (
        <button
          onClick={() => setVisibleCount((c) => c + BATCH)}
          className="self-center rounded-md border border-border bg-card px-5 py-2 font-mono text-[12px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-ember/40 hover:text-foreground"
        >
          Show {Math.min(BATCH, remaining)} more
        </button>
      )}
    </div>
  )
}
