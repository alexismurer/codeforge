import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { getChallenges, getUserProgress } from '@/lib/challenges'
import { ChallengeGrid } from '@/components/challenges/ChallengeGrid'
import { ChallengeFilters } from '@/components/challenges/ChallengeFilters'
import type { ChallengeProgress, Topic } from '@/lib/types'

type SearchParams = { topic?: Topic; difficulty?: string }

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { topic, difficulty } = await searchParams
  const { userId } = await auth()

  const [challenges, progressList] = await Promise.all([
    getChallenges(),
    userId ? getUserProgress(userId) : Promise.resolve([]),
  ])

  const progressMap: Record<string, ChallengeProgress> = Object.fromEntries(
    progressList.map((p) => [p.challenge_id, p])
  )

  const filtered = challenges.filter((c) => {
    if (topic && c.topic !== topic) return false
    if (difficulty && difficulty !== 'all' && c.difficulty !== Number(difficulty)) return false
    return true
  })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">{'// The anvil'}</span>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">Challenges</h1>
        </div>
        <p className="font-mono text-[12px] text-muted-foreground">
          <span className="text-ember">{filtered.length}</span> challenge{filtered.length !== 1 ? 's' : ''} in the queue
        </p>
      </div>

      <Suspense>
        <ChallengeFilters />
      </Suspense>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-16 text-center font-mono text-[13px] text-muted-foreground">
          No challenges match your filters.
        </p>
      ) : (
        <ChallengeGrid challenges={filtered} progressMap={progressMap} />
      )}
    </div>
  )
}
