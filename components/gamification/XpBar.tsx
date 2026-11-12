'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { LEVEL_THRESHOLDS, LEVEL_NAMES } from '@/lib/gamification'
import { prefersReducedMotion } from '@/lib/motion'

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
  const width = `${Math.min(progress, 100)}%`

  useEffect(() => {
    if (!barRef.current) return
    if (prefersReducedMotion()) {
      barRef.current.style.width = width
      return
    }
    const tween = gsap.fromTo(
      barRef.current,
      { width: '0%' },
      { width, duration: 1.4, ease: 'power3.out', delay: 0.25 }
    )
    return () => { tween.kill() }
  }, [width])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Lv {level}</span>
          <span className="font-display text-base font-semibold text-ember">{LEVEL_NAMES[level - 1]}</span>
        </span>
        {level < LEVEL_NAMES.length ? (
          <span className="font-mono text-[11px] text-muted-foreground">
            {xp.toLocaleString()} <span className="text-faint">/ {nextThreshold.toLocaleString()} XP</span>
          </span>
        ) : (
          <span className="font-mono text-[11px] text-molten">Max level</span>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-surface-2">
        <div
          ref={barRef}
          className="relative h-full rounded-full bg-[linear-gradient(90deg,var(--ember),var(--molten))] after:absolute after:right-0 after:top-1/2 after:size-2 after:-translate-y-1/2 after:translate-x-1/2 after:rounded-full after:bg-[#fff3dc] after:shadow-[0_0_10px_2px_var(--molten)]"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  )
}
