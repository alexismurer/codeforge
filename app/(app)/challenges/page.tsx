import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { getChallenges, getUserProgress } from '@/lib/challenges'
import { ChallengeCard } from '@/components/challenges/ChallengeCard'
import { ChallengeFilters } from '@/components/challenges/ChallengeFilters'
import type { Topic } from '@/lib/types'

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

  const progressMap = Object.fromEntries(
    progressList.map((p) => [p.challenge_id, p])
  )

  const filtered = challenges.filter((c) => {
    if (topic && c.topic !== topic) return false
    if (difficulty && difficulty !== 'all' && c.difficulty !== Number(difficulty)) return false
    return true
  })

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">Challenges</h1>
        <p className="text-zinc-500 text-sm">
          {filtered.length} challenge{filtered.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <Suspense>
        <ChallengeFilters />
      </Suspense>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="text-zinc-500 text-sm py-8 text-center">
            No challenges match your filters.
          </p>
        ) : (
          filtered.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              progress={progressMap[challenge.id]}
            />
          ))
        )}
      </div>
    </div>
  )
}
