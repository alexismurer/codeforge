import { CheckCircle, XCircle, Circle } from '@phosphor-icons/react/dist/ssr'
import type { RunResult, TestResult } from '@/lib/types'

type Props = {
  result: RunResult | null
  running: boolean
}

function TestRow({ test }: { test: TestResult }) {
  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs mb-1.5 ${
        test.passed
          ? 'bg-emerald-950/30 border-emerald-900/50'
          : 'bg-red-950/30 border-red-900/50'
      }`}
    >
      {test.passed ? (
        <CheckCircle size={14} weight="fill" className="text-emerald-400 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle size={14} weight="fill" className="text-red-400 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className={test.passed ? 'text-emerald-300' : 'text-red-300'}>{test.name}</span>
        {!test.passed && test.error && (
          <span className="text-red-500 font-mono text-[11px] break-all">{test.error}</span>
        )}
      </div>
    </div>
  )
}

export function TestResults({ result, running }: Props) {
  if (running) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm gap-2">
        <Circle size={14} className="animate-spin" />
        Running tests…
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 text-sm text-center px-4">
        Click <span className="mx-1 font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-zinc-400">Run Tests</span> to see results
      </div>
    )
  }

  const passCount = result.results.filter((r) => r.passed).length

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">
          {passCount}/{result.results.length} passing
        </span>
        <span className="text-[11px] text-zinc-600">{result.totalMs}ms</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {result.results.map((test, i) => (
          <TestRow key={i} test={test} />
        ))}
      </div>
      {result.results.some((r) => r.name.startsWith('__hidden')) && (
        <div className="px-3 py-2 border-t border-zinc-800 text-[11px] text-zinc-600 text-center">
          Hidden tests unlock on first full pass
        </div>
      )}
    </div>
  )
}
