import Link from 'next/link'
import { CheckCircle, ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import { DifficultyHeat } from './DifficultyHeat'
import { TopicLogo } from './TopicLogo'
import type { Challenge, ChallengeProgress } from '@/lib/types'

const TOPIC_LABELS: Record<string, string> = {
  js: 'JS',
  ts: 'TS',
  react: 'React',
}

const TYPE_LABELS: Record<string, string> = {
  implement: 'Implement',
  'fix-bug': 'Fix bug',
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
      className="group relative flex flex-col gap-4 overflow-hidden rounded-md border border-border bg-card p-4 transition-colors duration-200 hover:border-ember/40 hover:bg-surface-2/60 focus-visible:outline-2 focus-visible:outline-ember"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 h-24 bg-[radial-gradient(closest-side,var(--ember),transparent)] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
      />
      {solved && <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-ember" />}

      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
        <span aria-hidden className="flex">
          <TopicLogo topic={challenge.topic} className="size-4" />
        </span>
        <span className="text-muted-foreground">{TOPIC_LABELS[challenge.topic]}</span>
        <span>/</span>
        <span>{TYPE_LABELS[challenge.type]}</span>
        <span className="ml-auto">
          {solved ? (
            <span className="flex items-center gap-1 text-ember">
              <CheckCircle size={13} weight="fill" /> Solved
            </span>
          ) : attempted ? (
            <span className="text-muted-foreground">In progress</span>
          ) : (
            <ArrowUpRight
              size={14}
              className="text-faint transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ember"
            />
          )}
        </span>
      </div>

      <span className="text-[15px] font-medium leading-snug text-foreground">{challenge.title}</span>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <DifficultyHeat difficulty={challenge.difficulty} />
        <span className="font-mono text-[11px] text-molten">+{challenge.xp_reward} XP</span>
      </div>
    </Link>
  )
}
