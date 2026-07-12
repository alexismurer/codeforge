'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, ArrowCounterClockwise, CheckCircle } from '@phosphor-icons/react'
import { recordSubmission, type SubmitResult } from '@/lib/actions/submission'
import { SolveAnimation } from '@/components/gamification/SolveAnimation'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { IframeRunner, type IframeRunnerHandle } from '@/components/editor/IframeRunner'
import { TestResults } from '@/components/editor/TestResults'
import { ProblemPanel } from '@/components/editor/ProblemPanel'
import { AiHintPanel } from '@/components/editor/AiHintPanel'
import type { Challenge, ChallengeProgress, RunResult } from '@/lib/types'

type Props = {
  challenge: Challenge
  progress: ChallengeProgress | null
  userId: string | null
}

const MONACO_LANG: Record<string, 'javascript' | 'typescript'> = {
  js: 'javascript',
  ts: 'typescript',
  react: 'typescript',
}

export function ChallengeEditorClient({ challenge, progress, userId }: Props) {
  const [code, setCode] = useState(challenge.starter_code)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [solveResult, setSolveResult] = useState<SubmitResult | null>(null)
  const [aiHintUsed, setAiHintUsed] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const startTimeRef = useRef(Date.now())

  const runnerRef = useRef<IframeRunnerHandle>(null)

  const handleRun = useCallback(() => {
    setRunning(true)
    setRunResult(null)
    runnerRef.current?.run(code, challenge.test_suite)
  }, [code, challenge.test_suite])

  const handleResult = useCallback(
    async (result: RunResult) => {
      setRunning(false)
      setRunResult(result)

      if (!userId) return

      const timeToSolve = Math.floor((Date.now() - startTimeRef.current) / 1000)

      try {
        const submitResult = await recordSubmission({
          challengeId: challenge.id,
          code,
          passed: result.passed,
          timeToSolveSeconds: timeToSolve,
          aiHintUsed,
          challengeXpReward: challenge.xp_reward,
          challengeTopic: challenge.topic,
          challengeType: challenge.type,
          challengeTags: challenge.tags,
          challengeDifficulty: challenge.difficulty,
        })

        if (result.passed) {
          setSolveResult(submitResult)
          setShowAnimation(true)
        }
      } catch (e) {
        console.error('Submission error:', e)
      }
    },
    [userId, code, challenge, aiHintUsed]
  )

  const handleError = useCallback((msg: string) => {
    setRunning(false)
    setRunResult({
      results: [{ name: 'Execution error', passed: false, error: msg }],
      passed: false,
      totalMs: 0,
    })
  }, [])

  const handleReset = () => {
    setCode(challenge.starter_code)
    setRunResult(null)
  }

  const passCount = runResult?.results.filter((r) => r.passed).length ?? 0
  const totalCount = runResult?.results.length ?? 0

  return (
    <div className="flex flex-col h-[calc(100vh-52px)]">
      {/* Challenge bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950 flex-shrink-0">
        <Link
          href="/challenges"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <span className="font-semibold text-zinc-100 text-sm">{challenge.title}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
          >
            <ArrowCounterClockwise size={13} />
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
          >
            <Play size={13} weight="fill" />
            Run Tests
          </button>
          <div className="relative">
            <AiHintPanel
              challenge={challenge}
              code={code}
              runResult={runResult}
              onHintUsed={() => setAiHintUsed(true)}
            />
          </div>
        </div>
      </div>

      {solveResult && (
        <div className="bg-emerald-950 border-b border-emerald-800 px-4 py-2.5 flex items-center gap-4 flex-shrink-0">
          <CheckCircle size={18} weight="fill" className="text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">
            Challenge solved! +{solveResult.xpEarned} XP
            {solveResult.newLevel && ` · Level up — ${solveResult.newLevel}`}
            {solveResult.newBadges.length > 0 && ` · 🏆 ${solveResult.newBadges.join(', ')}`}
          </span>
          <Link href="/challenges" className="ml-auto text-xs text-emerald-500 hover:text-emerald-300">
            Next challenge →
          </Link>
        </div>
      )}

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Problem panel */}
        <div className="w-[280px] flex-shrink-0 border-r border-zinc-800 overflow-y-auto">
          <ProblemPanel challenge={challenge} progress={progress} />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={MONACO_LANG[challenge.topic]}
            />
          </div>
          {/* Run status bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-t border-zinc-800 bg-zinc-950 flex-shrink-0">
            <div
              className={`w-2 h-2 rounded-full ${
                !runResult
                  ? 'bg-zinc-700'
                  : runResult.passed
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-red-400 shadow-[0_0_6px_#f87171]'
              }`}
            />
            <span className="text-xs text-zinc-500">
              {!runResult
                ? 'Not run yet'
                : runResult.passed
                ? `All ${totalCount} tests passing`
                : `${passCount}/${totalCount} tests passing`}
            </span>
          </div>
        </div>

        {/* Test results panel */}
        <div className="w-[240px] flex-shrink-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wide">Test Results</span>
          </div>
          <div className="h-[calc(100%-37px)]">
            <TestResults result={runResult} running={running} />
          </div>
        </div>
      </div>

      {/* Hidden iframe runner */}
      <IframeRunner ref={runnerRef} onResult={handleResult} onError={handleError} />

      {showAnimation && solveResult && (
        <SolveAnimation
          xpEarned={solveResult.xpEarned}
          onComplete={() => setShowAnimation(false)}
        />
      )}
    </div>
  )
}
