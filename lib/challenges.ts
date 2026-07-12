import { createClient } from '@/lib/supabase/server'
import type { Challenge, ChallengeProgress } from '@/lib/types'

export async function getChallenges(): Promise<Challenge[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('difficulty', { ascending: true })
    .order('order_index', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export async function getUserProgress(userId: string): Promise<ChallengeProgress[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('challenge_progress')
    .select('challenge_id, status, best_time, attempts')
    .eq('user_id', userId)

  return data ?? []
}
