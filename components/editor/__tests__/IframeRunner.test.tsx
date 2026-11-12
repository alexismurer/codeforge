import { describe, it, expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'
import { createRef } from 'react'
import { stripHiddenMarkers, IframeRunner, RUNNER_URL } from '../IframeRunner'
import type { IframeRunnerHandle } from '../IframeRunner'

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

test('run() loads the runner page and sends the job once it is ready', () => {
  const ref = createRef<IframeRunnerHandle>()
  render(<IframeRunner ref={ref} onResult={() => {}} onError={() => {}} />)
  const iframe = document.querySelector('iframe')!

  ref.current?.run('const x = 1', "// __hidden__\ntest('t', () => {})", { jsx: true })
  expect(iframe.getAttribute('src')).toBe(RUNNER_URL)

  const runnerWindow = iframe.contentWindow!
  const postSpy = vi.spyOn(runnerWindow, 'postMessage')

  window.dispatchEvent(new MessageEvent('message', { data: { type: 'test-ready' }, source: runnerWindow }))
  window.dispatchEvent(new MessageEvent('message', { data: { type: 'test-ready' }, source: runnerWindow }))

  expect(postSpy).toHaveBeenCalledTimes(1)
  expect(postSpy).toHaveBeenCalledWith(
    { type: 'run', code: 'const x = 1', testSuite: "test('t', () => {})", jsx: true },
    '*'
  )
})

test('forwards results and errors from the runner', () => {
  const onResult = vi.fn()
  const onError = vi.fn()
  render(<IframeRunner onResult={onResult} onError={onError} />)
  const result = { type: 'test-result', results: [], passed: true, totalMs: 1 }

  window.dispatchEvent(new MessageEvent('message', { data: result }))
  window.dispatchEvent(new MessageEvent('message', { data: { type: 'test-error', message: 'boom' } }))

  expect(onResult).toHaveBeenCalledWith(result)
  expect(onError).toHaveBeenCalledWith('boom')
})
