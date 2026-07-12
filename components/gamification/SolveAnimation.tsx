'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

type Props = {
  xpEarned: number
  onComplete?: () => void
}

export function SolveAnimation({ xpEarned, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !xpRef.current) return

    const particles = Array.from({ length: 20 }, (_, i) => {
      const el = document.createElement('div')
      el.className = 'absolute w-2 h-2 rounded-full pointer-events-none'
      el.style.backgroundColor = i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#a855f7' : '#34d399'
      el.style.left = '50%'
      el.style.top = '50%'
      containerRef.current!.appendChild(el)
      return el
    })

    particles.forEach((el) => {
      gsap.fromTo(
        el,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          opacity: 0,
          scale: Math.random() * 1.5 + 0.5,
          duration: 0.8 + Math.random() * 0.4,
          ease: 'power2.out',
          onComplete: () => el.remove(),
        }
      )
    })

    gsap.fromTo(
      xpRef.current,
      { scale: 0.5, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)', delay: 0.1 }
    )

    gsap.to(xpRef.current, {
      opacity: 0,
      y: -30,
      duration: 0.4,
      delay: 1.8,
      onComplete,
    })
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
    >
      <div
        ref={xpRef}
        className="bg-emerald-950 border border-emerald-700 text-emerald-300 px-6 py-3 rounded-2xl text-lg font-bold shadow-2xl"
        style={{ opacity: 0 }}
      >
        +{xpEarned} XP
      </div>
    </div>
  )
}
