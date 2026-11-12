'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, ArrowCounterClockwise, CheckCircle } from '@phosphor-icons/react'
import { recordSubmission, type SubmitResult } from '@/lib/actions/submission'
import { SolveAnimation } from '@/components/gamification/SolveAnimation'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { IframeRunner, type IframeRunnerHandle } from '@/components/editor/IframeRunner'
import { TestResults } from '@/components/editor/TestResults'
import { ProblemPanel } from '@/components/editor/ProblemPanel'
import { AiHintPanel } from '@/components/editor/AiHintPanel'
import { CountUp } from '@/components/motion/CountUp'
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runnerRef = useRef<IframeRunnerHandle>(null)

  const handleRun = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setRunning(false)
      setRunResult({
        results: [{ name: 'Timeout', passed: false, error: 'Tests timed out after 10s' }],
        passed: false,
        totalMs: 10000,
      })
    }, 10000)
    setRunning(true)
    setRunResult(null)
    runnerRef.current?.run(code, challenge.test_suite, { jsx: challenge.topic === 'react' })
  }, [code, challenge.test_suite, challenge.topic])

  const handleResult = useCallback(
    async (result: RunResult) => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
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
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    setRunning(false)
    setRunResult({
      results: [{ name: 'Execution error', passed: false, error: msg }],
      passed: false,
      totalMs: 0,
    })
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
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
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background flex-shrink-0">
        <Link
          href="/challenges"
          aria-label="Back to challenges"
          className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-ember/40 hover:text-foreground"
        >
          <ArrowLeft size={14} />
        </Link>
        <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-faint sm:inline">Challenges /</span>
        <span className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-foreground">{challenge.title}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowCounterClockwise size={13} />
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="ember-glow flex h-8 items-center gap-1.5 rounded-md bg-ember px-4 text-xs font-semibold text-primary-foreground transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            <Play size={12} weight="fill" />
            {running ? 'Running…' : 'Run tests'}
          </button>
          <AiHintPanel
            challenge={challenge}
            code={code}
            runResult={runResult}
            onHintUsed={() => setAiHintUsed(true)}
          />
        </div>
      </div>

      {solveResult && (
        <div className="relative flex flex-shrink-0 items-center gap-4 overflow-hidden border-b border-ember/30 bg-ember/10 px-4 py-2.5">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,oklch(0.70_0.19_45/25%),transparent)]" />
          <CheckCircle size={18} weight="fill" className="relative text-ember" />
          <span className="relative text-sm font-medium text-foreground">
            Forged. <span className="font-mono text-molten">+<CountUp value={solveResult.xpEarned} /> XP</span>
            {solveResult.newLevel && <span className="text-muted-foreground"> · Level up: <span className="text-foreground">{solveResult.newLevel}</span></span>}
            {solveResult.newBadges.length > 0 && <span className="text-muted-foreground"> · New badge: <span className="text-foreground">{solveResult.newBadges.join(', ')}</span></span>}
          </span>
          <Link href="/challenges" className="relative ml-auto font-mono text-[11px] uppercase tracking-[0.12em] text-ember hover:text-molten">
            Next challenge →
          </Link>
        </div>
      )}

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Problem panel */}
        <div className="w-[280px] flex-shrink-0 border-r border-border bg-card/40 overflow-y-auto">
          <ProblemPanel challenge={challenge} progress={progress} />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border bg-[#1a1714]">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={MONACO_LANG[challenge.topic]}
            />
          </div>
          {/* Run status bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-background flex-shrink-0">
            <div
              className={`size-2 rounded-full ${
                !runResult
                  ? 'bg-surface-2'
                  : runResult.passed
                  ? 'bg-success shadow-[0_0_8px_var(--success)]'
                  : 'bg-destructive shadow-[0_0_8px_var(--destructive)]'
              }`}
            />
            <span className="font-mono text-[11px] text-muted-foreground">
              {!runResult
                ? 'Not run yet'
                : runResult.passed
                ? `All ${totalCount} tests passing`
                : `${passCount}/${totalCount} tests passing`}
            </span>
          </div>
        </div>

        {/* Test results panel */}
        <div className="w-[260px] flex-shrink-0 overflow-hidden bg-card/40">
          <div className="flex h-[37px] items-center gap-2 px-3 border-b border-border">
            <span className="eyebrow">Test results</span>
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
