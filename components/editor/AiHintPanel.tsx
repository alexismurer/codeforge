'use client'

import { useRef, useState } from 'react'
import { Sparkle, X } from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Challenge, RunResult } from '@/lib/types'

const mdComponents: Components = {
  code({ className, children, ...props }) {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <pre className="my-2 overflow-x-auto rounded-[4px] border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
          <code>{children}</code>
        </pre>
      )
    }
    return (
      <code className="rounded-[3px] bg-surface-2 px-1 py-0.5 font-mono text-xs text-molten" {...props}>
        {children}
      </code>
    )
  },
  p({ children }) {
    return <p className="mb-2 last:mb-0">{children}</p>
  },
  ul({ children }) {
    return <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
  },
}

type Props = {
  challenge: Challenge
  code: string
  runResult: RunResult | null
  onHintUsed: () => void
}

export function AiHintPanel({ challenge, code, runResult, onHintUsed }: Props) {
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const fetchHint = async () => {
    if (loading) return
    onHintUsed()
    setOpen(true)
    setHint('')
    setLoading(true)

    abortRef.current = new AbortController()

    try {
      const failingTests = (runResult?.results ?? [])
        .filter((r) => !r.passed)
        .map((r) => `- ${r.name}${r.error ? `: ${r.error}` : ''}`)

      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          failingTests,
          challengeTitle: challenge.title,
          challengeDescription: challenge.description,
          aiContext: challenge.ai_context,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        setHint('Could not get a hint right now. Try again in a moment.')
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setHint((prev) => prev + decoder.decode(value))
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        setHint('Could not get a hint right now. Try again in a moment.')
      }
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    abortRef.current?.abort()
    setOpen(false)
    setHint('')
  }

  if (!open) {
    return (
      <button
        onClick={fetchHint}
        disabled={runResult?.passed === true}
        className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:border-ember/40 disabled:opacity-40"
      >
        <Sparkle size={13} weight="fill" className="text-ember" />
        Hint
      </button>
    )
  }

  return (
    <>
      <button
        onClick={close}
        className="flex h-8 items-center gap-1.5 rounded-md border border-ember/40 bg-ember/10 px-3 text-xs font-medium text-foreground"
      >
        <Sparkle size={13} weight="fill" className="text-ember" />
        Hint
        <X size={11} className="ml-1 opacity-70" />
      </button>

      <div className="absolute bottom-[40px] left-[280px] right-[260px] z-10 rounded-t-md border border-b-0 border-border bg-card shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <span className="font-mono text-[11px] text-ember">&gt;</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">hint</span>
          {loading && (
            <span className="ml-2 animate-pulse font-mono text-[10px] text-faint">thinking…</span>
          )}
          <button onClick={close} aria-label="Close hint" className="ml-auto text-faint hover:text-foreground">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[180px] min-h-[60px] overflow-y-auto px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {hint ? (
            <ReactMarkdown components={mdComponents}>{hint}</ReactMarkdown>
          ) : loading ? null : (
            'No hint available.'
          )}
          {loading && <span className="inline-block w-1.5 h-3.5 bg-ember animate-pulse ml-0.5 align-middle" />}
        </div>
      </div>
    </>
  )
}
