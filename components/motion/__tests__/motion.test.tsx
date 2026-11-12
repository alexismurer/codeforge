import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { prefersReducedMotion } from '@/lib/motion'
import { CountUp } from '../CountUp'
import { Reveal } from '../Reveal'

describe('motion primitives', () => {
  it('prefersReducedMotion is true when matchMedia is missing', () => {
    expect(prefersReducedMotion()).toBe(true)
  })

  it('CountUp renders the final formatted value immediately', () => {
    render(<CountUp value={1250} />)
    expect(screen.getByText('1,250')).toBeInTheDocument()
  })

  it('Reveal renders children visible', () => {
    render(
      <Reveal>
        <p data-reveal>hi</p>
      </Reveal>
    )
    expect(screen.getByText('hi')).toBeVisible()
  })
})
