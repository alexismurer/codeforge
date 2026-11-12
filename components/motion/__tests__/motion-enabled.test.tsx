import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { gsap } from 'gsap'
import { CountUp } from '../CountUp'
import { HeroEditor } from '@/components/landing/HeroEditor'

describe('with motion enabled', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia
  })
  afterEach(() => {
    // @ts-expect-error restore jsdom default
    delete window.matchMedia
    vi.restoreAllMocks()
  })

  it('CountUp tweens from the previous value, not from 0', () => {
    const spy = vi.spyOn(gsap, 'to')
    const { rerender } = render(<CountUp value={100} />)
    rerender(<CountUp value={250} />)
    const target = spy.mock.calls.at(-1)![0] as { n: number }
    expect(target.n).toBe(100)
  })

  it('HeroEditor keeps sparks hidden until the burst', () => {
    const { container } = render(<HeroEditor />)
    const sparks = Array.from(container.querySelectorAll<HTMLElement>('[data-spark]'))
    expect(sparks.length).toBeGreaterThan(0)
    for (const s of sparks) expect(s.style.opacity).not.toBe('1')
  })
})
