'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/lib/motion'

type Props = {
  children: React.ReactNode
  className?: string
  stagger?: number
  y?: number
  delay?: number
}

export function Reveal({ children, className, stagger = 0.06, y = 16, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const marked = el.querySelectorAll('[data-reveal]')
      const targets = marked.length > 0 ? marked : el.children
      gsap.from(targets, { opacity: 0, y, stagger, delay, duration: 0.6, ease: 'power3.out', clearProps: 'all' })
    }, el)
    return () => ctx.revert()
  }, [stagger, y, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
