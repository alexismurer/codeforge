import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopicLogo } from '../TopicLogo'

describe('TopicLogo', () => {
  it.each([
    ['js', 'JavaScript logo'],
    ['ts', 'TypeScript logo'],
    ['react', 'React logo'],
  ])('renders the %s logo', (topic, label) => {
    render(<TopicLogo topic={topic} />)
    expect(screen.getByRole('img', { name: label })).toBeInTheDocument()
  })

  it('renders nothing for an unknown topic', () => {
    const { container } = render(<TopicLogo topic="python" />)
    expect(container).toBeEmptyDOMElement()
  })
})
