'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Topic } from '@/lib/types'

const TOPICS: { value: Topic | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'react', label: 'React' },
]

const DIFFICULTIES = [
  { value: 'all', label: 'Any difficulty' },
  { value: '1', label: 'Easy' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Hard' },
  { value: '4', label: 'Expert' },
  { value: '5', label: 'Legendary' },
]

export function ChallengeFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const topic = params.get('topic') ?? 'all'
  const difficulty = params.get('difficulty') ?? 'all'

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    router.push(`/challenges?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="tablist" className="flex rounded-md border border-border bg-card p-0.5">
        {TOPICS.map((t) => {
          const active = topic === t.value
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter('topic', t.value)}
              className={`relative rounded-[4px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                active ? 'bg-surface-2 text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              {active && <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-ember" />}
            </button>
          )
        })}
      </div>
      <select
        value={difficulty}
        onChange={(e) => setFilter('difficulty', e.target.value)}
        aria-label="Difficulty"
        className="h-[34px] rounded-md border border-border bg-card px-3 text-[13px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:border-ember/60"
      >
        {DIFFICULTIES.map((d) => (
          <option key={d.value} value={d.value} className="bg-card text-foreground">
            {d.label}
          </option>
        ))}
      </select>
    </div>
  )
}
