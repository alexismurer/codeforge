'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import type { RunResult, TestResult } from '@/lib/types'

export type IframeRunnerHandle = {
  run: (code: string, testSuite: string) => void
}

type Props = {
  onResult: (result: RunResult) => void
  onError: (message: string) => void
}

function stripHiddenMarkers(suite: string) {
  return suite.replace(/\/\/ __hidden__\n?/g, '')
}

function stripExports(code: string): string {
  return code
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+((?:async\s+)?function|class|const|let|var)/gm, '$1')
}

export function buildIframeDoc(code: string, testSuite: string): string {
  const cleanSuite = stripHiddenMarkers(testSuite)
  const cleanCode = stripExports(code)
  return `<!DOCTYPE html>
<html>
<head>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script>
window.onerror = function(msg) {
  window.parent.postMessage({ type: 'test-error', message: String(msg) }, '*');
  return true;
};
<\/script>
</head>
<body>
<script>
// Minimal test harness
const __tests = [];
const __results = [];

window.test = (name, fn) => __tests.push({ name, fn });
window.describe = (_label, fn) => fn();
window.expect = (received) => ({
  toBe: (expected) => {
    if (!Object.is(received, expected))
      throw new Error('Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(received));
  },
  toEqual: (expected) => {
    if (JSON.stringify(received) !== JSON.stringify(expected))
      throw new Error('Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(received));
  },
  toThrow: (msg) => {
    // used in async contexts — handled below
  },
  rejects: {
    toThrow: async (msg) => {
      try { await received; throw new Error('Did not throw'); }
      catch (e) { if (msg && !e.message.includes(msg)) throw new Error('Expected to throw: ' + msg + ' but got: ' + e.message); }
    }
  }
});
window.act = async (fn) => fn();
window.renderHook = (hookFn, opts) => {
  let result = { current: hookFn(opts?.initialProps ?? {}) };
  return {
    result,
    rerender: (newProps) => { result.current = hookFn(newProps ?? {}); },
  };
};
<\/script>
<script type="text/babel" data-presets="typescript">
${cleanCode}
<\/script>
<script type="text/babel" data-presets="typescript">
${cleanSuite}

(async () => {
  const start = Date.now();
  for (const t of __tests) {
    try {
      await t.fn();
      __results.push({ name: t.name, passed: true });
    } catch (e) {
      __results.push({ name: t.name, passed: false, error: e.message });
    }
  }
  const totalMs = Date.now() - start;
  const passed = __results.every(r => r.passed);
  window.parent.postMessage({ type: 'test-result', results: __results, passed, totalMs }, '*');
})();
<\/script>
</body>
</html>`
}

export const IframeRunner = forwardRef<IframeRunnerHandle, Props>(
  ({ onResult, onError }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useImperativeHandle(ref, () => ({
      run(code: string, testSuite: string) {
        const iframe = iframeRef.current
        if (!iframe) return
        iframe.srcdoc = ''
        iframe.srcdoc = buildIframeDoc(code, testSuite)
      },
    }))

    useEffect(() => {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'test-result') {
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
