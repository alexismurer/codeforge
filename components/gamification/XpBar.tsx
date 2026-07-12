'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { LEVEL_THRESHOLDS, LEVEL_NAMES } from '@/lib/gamification'

type Props = {
  xp: number
  level: number
}

export function XpBar({ xp, level }: Props) {
  const barRef = useRef<HTMLDivElement>(null)

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const progress = level >= LEVEL_NAMES.length
    ? 100
    : ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100

  useEffect(() => {
    if (!barRef.current) return
    gsap.fromTo(
      barRef.current,
      { width: '0%' },
      { width: `${Math.min(progress, 100)}%`, duration: 1.2, ease: 'power2.out', delay: 0.3 }
    )
  }, [progress])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-indigo-400 font-semibold">{LEVEL_NAMES[level - 1]}</span>
        {level < LEVEL_NAMES.length && (
          <span className="text-zinc-500">
            {xp.toLocaleString()} / {nextThreshold.toLocaleString()} XP
          </span>
        )}
        {level >= LEVEL_NAMES.length && (
          <span className="text-amber-400 font-semibold">Max Level</span>
        )}
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  )
}
