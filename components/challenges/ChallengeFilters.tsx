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
  { value: '1', label: '★ Easy' },
  { value: '2', label: '★★ Medium' },
  { value: '3', label: '★★★ Hard' },
  { value: '4', label: '★★★★ Expert' },
  { value: '5', label: '★★★★★ Legendary' },
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
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-1">
        {TOPICS.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter('topic', t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              topic === t.value
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <select
        value={difficulty}
        onChange={(e) => setFilter('difficulty', e.target.value)}
        className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 outline-none"
      >
        {DIFFICULTIES.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  )
}
