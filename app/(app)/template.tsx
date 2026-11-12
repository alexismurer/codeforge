'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/lib/motion'

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return
    const tween = gsap.from(ref.current, { opacity: 0, y: 8, duration: 0.35, ease: 'power2.out', clearProps: 'all' })
    return () => { tween.kill() }
  }, [])

  return <div ref={ref} className="h-full">{children}</div>
}
