import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getChallengeBySlug, getUserProgress } from '@/lib/challenges'
import { ChallengeEditorClient } from './ChallengeEditorClient'

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { userId } = await auth()

  const challenge = await getChallengeBySlug(slug)
  if (!challenge) notFound()

  const progressList = userId ? await getUserProgress(userId) : []
  const progress = progressList.find((p) => p.challenge_id === challenge.id) ?? null

  return (
    <ChallengeEditorClient
      challenge={challenge}
      progress={progress}
      userId={userId}
    />
  )
}
