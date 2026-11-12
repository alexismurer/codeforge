import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DifficultyHeat } from '../DifficultyHeat'

describe('DifficultyHeat', () => {
  it('fills bars up to the difficulty and labels it', () => {
    const { container } = render(<DifficultyHeat difficulty={3} />)
    expect(screen.getByLabelText('Difficulty 3 of 5: Hard')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(3)
    expect(screen.getByText('Hard')).toBeInTheDocument()
  })

  it('hides the label when showLabel is false', () => {
    render(<DifficultyHeat difficulty={5} showLabel={false} />)
    expect(screen.queryByText('Legendary')).not.toBeInTheDocument()
  })
})
