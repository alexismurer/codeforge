'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/lib/motion'

type Props = {
  xpEarned: number
  onComplete?: () => void
}

const SPARK_COLORS = ['#f2803a', '#f5c26b', '#fff3dc']

export function SolveAnimation({ xpEarned, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !xpRef.current || !flashRef.current) return

    if (prefersReducedMotion()) {
      gsap.set(xpRef.current, { opacity: 1 })
      const t = setTimeout(() => onComplete?.(), 1200)
      return () => clearTimeout(t)
    }

    const sparks = Array.from({ length: 30 }, (_, i) => {
      const el = document.createElement('div')
      const size = gsap.utils.random(2, 6)
      el.className = 'absolute rounded-full pointer-events-none'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.backgroundColor = SPARK_COLORS[i % SPARK_COLORS.length]
      el.style.boxShadow = `0 0 ${size * 2}px ${SPARK_COLORS[i % 2]}`
      el.style.left = '50%'
      el.style.top = '50%'
      container.appendChild(el)
      return el
    })

    const ctx = gsap.context(() => {
      gsap.fromTo(flashRef.current, { opacity: 0.8, scale: 0.4 }, { opacity: 0, scale: 1.6, duration: 0.9, ease: 'power2.out' })

      sparks.forEach((el) => {
        const angle = gsap.utils.random(-Math.PI * 0.95, -Math.PI * 0.05)
        const dist = gsap.utils.random(120, 320)
        gsap.timeline({ onComplete: () => el.remove() })
          .to(el, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            duration: gsap.utils.random(0.5, 0.8),
            ease: 'power3.out',
          })
          .to(el, { y: '+=140', opacity: 0, duration: gsap.utils.random(0.6, 0.9), ease: 'power2.in' })
      })

      gsap.timeline({ onComplete })
        .fromTo(xpRef.current, { scale: 0.6, opacity: 0, y: 24 }, { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: 'back.out(2.2)', delay: 0.08 })
        .to(xpRef.current, { opacity: 0, y: -36, duration: 0.45, ease: 'power2.in' }, '+=1.2')
    }, container)

    return () => {
      ctx.revert()
      sparks.forEach((el) => el.remove())
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        ref={flashRef}
        className="absolute size-[520px] rounded-full bg-[radial-gradient(closest-side,oklch(0.70_0.19_45/45%),transparent)] opacity-0"
      />
      <div
        ref={xpRef}
        className="relative flex flex-col items-center gap-1 rounded-md border border-ember/50 bg-card/95 px-8 py-4 shadow-[0_20px_80px_-10px_oklch(0.70_0.19_45/60%)]"
        style={{ opacity: 0 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Forged</span>
        <span className="ember-text font-display text-4xl font-bold tracking-[-0.03em]">+{xpEarned} XP</span>
      </div>
    </div>
  )
}
