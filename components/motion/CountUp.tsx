'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/lib/motion'

type Props = {
  value: number
  className?: string
  duration?: number
}

export function CountUp({ value, className, duration = 1.2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const fromRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const proxy = { n: fromRef.current }
    fromRef.current = value
    const tween = gsap.to(proxy, {
      n: value,
      duration,
      ease: 'power3.out',
      onUpdate: () => { el.textContent = Math.round(proxy.n).toLocaleString() },
    })
    return () => {
      tween.kill()
      el.textContent = value.toLocaleString()
    }
  }, [value, duration])

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {value.toLocaleString()}
    </span>
  )
}
