import { vi, describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChallengeGrid } from '../ChallengeGrid'
import type { Challenge } from '@/lib/types'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

function makeChallenge(i: number): Challenge {
  return {
    id: `id-${i}`,
    slug: `challenge-${i}`,
    title: `Challenge ${i}`,
    description: '',
    topic: 'js',
    type: 'implement',
    difficulty: 1,
    starter_code: '',
    test_suite: '',
    solution: '',
    ai_context: '',
    xp_reward: 50,
    tags: [],
    order_index: i,
    created_at: '2026-01-01',
  }
}

function makeChallenges(n: number): Challenge[] {
  return Array.from({ length: n }, (_, i) => makeChallenge(i))
}

describe('ChallengeGrid', () => {
  it('shows first 30 challenges when more exist', () => {
    render(<ChallengeGrid challenges={makeChallenges(50)} progressMap={{}} />)
    expect(screen.getAllByRole('link')).toHaveLength(30)
  })

  it('shows load-more button when more challenges exist', () => {
    render(<ChallengeGrid challenges={makeChallenges(50)} progressMap={{}} />)
    expect(screen.getByText('Show 20 more')).toBeInTheDocument()
  })

  it('hides load-more button when all challenges shown', () => {
    render(<ChallengeGrid challenges={makeChallenges(20)} progressMap={{}} />)
    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })

  it('loads next batch on button click', () => {
    render(<ChallengeGrid challenges={makeChallenges(50)} progressMap={{}} />)
    fireEvent.click(screen.getByText('Show 20 more'))
    expect(screen.getAllByRole('link')).toHaveLength(50)
  })

  it('shows exactly 30 challenges when count equals the batch size', () => {
    render(<ChallengeGrid challenges={makeChallenges(30)} progressMap={{}} />)
    expect(screen.getAllByRole('link')).toHaveLength(30)
    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })

  it('shows correct remaining count in button label', () => {
    render(<ChallengeGrid challenges={makeChallenges(35)} progressMap={{}} />)
    expect(screen.getByText('Show 5 more')).toBeInTheDocument()
  })
})
