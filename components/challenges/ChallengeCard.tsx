import Link from 'next/link'
import { CheckCircle, Circle, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { DifficultyStars } from './DifficultyStars'
import type { Challenge, ChallengeProgress } from '@/lib/types'

const TOPIC_COLORS: Record<string, string> = {
  js: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  ts: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  react: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
}

const TOPIC_LABELS: Record<string, string> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  react: 'React',
}

const TYPE_LABELS: Record<string, string> = {
  implement: 'Implement',
  'fix-bug': 'Fix Bug',
  refactor: 'Refactor',
  'multiple-choice': 'Quiz',
}

type Props = {
  challenge: Challenge
  progress?: ChallengeProgress
}

export function ChallengeCard({ challenge, progress }: Props) {
  const solved = progress?.status === 'solved'
  const attempted = progress?.status === 'attempted'

  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className="group flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded border ${TOPIC_COLORS[challenge.topic]}`}
          >
            {TOPIC_LABELS[challenge.topic]}
          </span>
          <span className="text-[11px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
            {TYPE_LABELS[challenge.type]}
          </span>
        </div>
        <span className="font-medium text-zinc-100 text-sm truncate">{challenge.title}</span>
        <DifficultyStars difficulty={challenge.difficulty} />
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <span className="text-[11px] text-amber-400 font-semibold">+{challenge.xp_reward} XP</span>
        {solved ? (
          <CheckCircle size={18} weight="fill" className="text-emerald-400" />
        ) : attempted ? (
          <Circle size={18} weight="regular" className="text-zinc-500" />
        ) : (
          <ArrowRight
            size={16}
            className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
          />
        )}
      </div>
    </Link>
  )
}
