import { describe, it, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { createRef } from 'react'
import { buildIframeDoc } from '../IframeRunner'
import { IframeRunner } from '../IframeRunner'
import type { IframeRunnerHandle } from '../IframeRunner'

// Extract the functions for testing without rendering
function stripHiddenMarkers(suite: string) {
  return suite.replace(/\/\/ __hidden__\n?/g, '')
}

describe('stripHiddenMarkers', () => {
  it('removes __hidden__ comment markers', () => {
    const input = "test('a', () => {});\n// __hidden__\ntest('b', () => {});"
    const result = stripHiddenMarkers(input)
    expect(result).toBe("test('a', () => {});\ntest('b', () => {});")
  })

  it('does not remove regular comments', () => {
    const input = "// normal comment\ntest('a', () => {});"
    expect(stripHiddenMarkers(input)).toBe(input)
  })
})

test('buildIframeDoc includes window.onerror handler', () => {
  const html = buildIframeDoc('const x = 1', "test('t', () => {})")
  expect(html).toContain('window.onerror = function')
  expect(html).toContain("type: 'test-error'")
})

test('run() resets srcdoc to empty string before loading new doc', () => {
  const ref = createRef<IframeRunnerHandle>()
  render(<IframeRunner ref={ref} onResult={() => {}} onError={() => {}} />)

  const srcdocValues: string[] = []
  const iframe = document.querySelector('iframe')!
  const descriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc')

  Object.defineProperty(iframe, 'srcdoc', {
    get: descriptor?.get,
    set(value: string) {
      srcdocValues.push(value)
      descriptor?.set?.call(this, value)
    },
    configurable: true,
  })

  ref.current?.run('const x = 1', "test('t', () => {})")

  expect(srcdocValues[0]).toBe('')
  expect(srcdocValues[1]).toContain('window.onerror')
})
