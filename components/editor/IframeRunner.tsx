'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import type { RunResult } from '@/lib/types'

export type IframeRunnerHandle = {
  run: (code: string, testSuite: string, options: { jsx: boolean }) => void
}

type Props = {
  onResult: (result: RunResult) => void
  onError: (message: string) => void
}

type RunJob = { type: 'run'; code: string; testSuite: string; jsx: boolean }

export const RUNNER_URL = '/test-runner.html'

export function stripHiddenMarkers(suite: string) {
  return suite.replace(/\/\/ __hidden__\n?/g, '')
}

export const IframeRunner = forwardRef<IframeRunnerHandle, Props>(
  ({ onResult, onError }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const pendingJobRef = useRef<RunJob | null>(null)

    useImperativeHandle(ref, () => ({
      run(code, testSuite, options) {
        const iframe = iframeRef.current
        if (!iframe) return
        pendingJobRef.current = { type: 'run', code, testSuite: stripHiddenMarkers(testSuite), jsx: options.jsx }
        // A real URL (not srcdoc) so suites can use location and history APIs.
        iframe.src = RUNNER_URL
      },
    }))

    useEffect(() => {
      const handler = (event: MessageEvent) => {
        const runnerWindow = iframeRef.current?.contentWindow
        if (event.data?.type === 'test-ready') {
          if (!runnerWindow || event.source !== runnerWindow || !pendingJobRef.current) return
          runnerWindow.postMessage(pendingJobRef.current, '*')
          pendingJobRef.current = null
        } else if (event.data?.type === 'test-result') {
          onResult(event.data as RunResult)
        } else if (event.data?.type === 'test-error') {
          onError(event.data.message)
        }
      }
      window.addEventListener('message', handler)
      return () => window.removeEventListener('message', handler)
    }, [onResult, onError])

    return (
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className="hidden"
        title="test-runner"
      />
    )
  }
)

IframeRunner.displayName = 'IframeRunner'
