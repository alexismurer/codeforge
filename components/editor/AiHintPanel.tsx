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
        <pre className="my-2 rounded bg-zinc-800 px-3 py-2 overflow-x-auto text-xs font-mono text-zinc-200">
          <code>{children}</code>
        </pre>
      )
    }
    return (
      <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs font-mono text-purple-300" {...props}>
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
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-medium transition-opacity"
      >
        <Sparkle size={13} weight="fill" />
        Hint
      </button>
    )
  }

  return (
    <>
      <button
        onClick={close}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium"
      >
        <Sparkle size={13} weight="fill" />
        Hint
        <X size={11} className="ml-1 opacity-70" />
      </button>

      <div className="absolute bottom-[40px] left-[280px] right-[240px] z-10 bg-zinc-900 border border-indigo-900/50 rounded-t-xl shadow-2xl shadow-indigo-950/50">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800">
          <Sparkle size={13} weight="fill" className="text-purple-400" />
          <span className="text-xs text-purple-300 font-semibold uppercase tracking-wide">
            Hint
          </span>
          {loading && (
            <span className="ml-2 text-[10px] text-zinc-500 animate-pulse">thinking…</span>
          )}
          <button onClick={close} className="ml-auto text-zinc-500 hover:text-zinc-300">
            <X size={14} />
          </button>
        </div>
        <div className="px-4 py-3 text-sm text-zinc-300 leading-relaxed min-h-[60px] max-h-[160px] overflow-y-auto">
          {hint ? (
            <ReactMarkdown components={mdComponents}>{hint}</ReactMarkdown>
          ) : loading ? null : (
            'No hint available.'
          )}
          {loading && <span className="inline-block w-1.5 h-3.5 bg-purple-400 animate-pulse ml-0.5 align-middle" />}
        </div>
      </div>
    </>
  )
}
