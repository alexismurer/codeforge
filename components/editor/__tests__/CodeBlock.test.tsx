import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { CodeBlock } from '../CodeBlock'

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
})

describe('CodeBlock', () => {
  test('renders code content', () => {
    render(<CodeBlock code="const x = 1" />)
    expect(screen.getAllByText('const x = 1').length).toBeGreaterThan(0)
  })

  test('opens modal when expand button is clicked', () => {
    render(<CodeBlock code="const x = 1" />)
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce()
  })

  test('closes modal when close button is clicked', () => {
    render(<CodeBlock code="const x = 1" />)
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce()
  })

  test('closes modal when backdrop is clicked', () => {
    render(<CodeBlock code="const x = 1" />)
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
    const dialog = screen.getByRole('dialog', { hidden: true })
    fireEvent.click(dialog)
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce()
  })

  test('closes modal on Escape key (cancel event)', () => {
    render(<CodeBlock code="const x = 1" />)
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
    const dialog = screen.getByRole('dialog', { hidden: true })
    fireEvent(dialog, new Event('cancel'))
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce()
  })
})
