import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import type { RunResult, TestResult } from '@/lib/types'

type Props = {
  result: RunResult | null
  running: boolean
}

function TestRow({ test }: { test: TestResult }) {
  return (
    <li className="flex flex-col gap-1.5 border-b border-border px-3 py-2.5 text-xs last:border-b-0">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-px shrink-0 rounded-[3px] px-1 py-px font-mono text-[9px] font-semibold tracking-wider ${
            test.passed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          }`}
        >
          {test.passed ? 'PASS' : 'FAIL'}
        </span>
        <span className={`min-w-0 leading-snug ${test.passed ? 'text-muted-foreground' : 'text-foreground'}`}>{test.name}</span>
      </div>
      {!test.passed && test.error && (
        <pre className="whitespace-pre-wrap break-words rounded-[4px] border border-destructive/20 bg-destructive/5 px-2 py-1.5 font-mono text-[10.5px] leading-relaxed text-destructive/90">
          {test.error}
        </pre>
      )}
    </li>
  )
}

export function TestResults({ result, running }: Props) {
  if (running) {
    return (
      <div className="flex h-full items-center justify-center gap-2 font-mono text-[12px] text-muted-foreground">
        <CircleNotch size={14} className="animate-spin text-ember" />
        running…
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-[13px] text-faint">
        <span>
          Press <kbd className="mx-0.5 rounded-[4px] border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">Run tests</kbd> to see results.
        </span>
      </div>
    )
  }

  const passCount = result.results.filter((r) => r.passed).length
  const allPassed = passCount === result.results.length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 font-mono text-[11px]">
        <span className={allPassed ? 'text-success' : 'text-foreground'}>
          {passCount}/{result.results.length} passing
        </span>
        <span className="text-faint">{result.totalMs}ms</span>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {result.results.map((test, i) => (
          <TestRow key={i} test={test} />
        ))}
      </ul>
      {result.results.some((r) => r.name.startsWith('__hidden')) && (
        <div className="border-t border-border px-3 py-2 text-center font-mono text-[10px] text-faint">
          Hidden tests unlock on first full pass
        </div>
      )}
    </div>
  )
}
