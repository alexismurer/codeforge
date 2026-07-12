import Image from 'next/image'
import { Tag, Lightning } from '@phosphor-icons/react/dist/ssr'
import { DifficultyStars } from '@/components/challenges/DifficultyStars'
import type { Challenge, ChallengeProgress } from '@/lib/types'

const TOPIC_LABELS: Record<string, string> = { js: 'JavaScript', ts: 'TypeScript', react: 'React' }
const TYPE_LABELS: Record<string, string> = {
  implement: 'Implement',
  'fix-bug': 'Fix Bug',
  refactor: 'Refactor',
  'multiple-choice': 'Quiz',
}

const TOPIC_IMAGES: Record<string, string> = {
  js: '/images/topic-js.png',
  ts: '/images/topic-ts.png',
  react: '/images/topic-react.png',
}

const TOPIC_GRADIENTS: Record<string, string> = {
  js: 'from-amber-950 to-zinc-900',
  ts: 'from-blue-950 to-zinc-900',
  react: 'from-teal-950 to-zinc-900',
}

type Props = {
  challenge: Challenge
  progress: ChallengeProgress | null
}

function markdownToHtml(md: string): string {
  return md
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

export function ProblemPanel({ challenge, progress }: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Topic banner — place generated images at public/images/topic-{js,ts,react}.png (recommended 560×160) */}
      <div className={`relative -mx-4 -mt-4 h-[88px] bg-gradient-to-br ${TOPIC_GRADIENTS[challenge.topic]} overflow-hidden`}>
        <Image
          src={TOPIC_IMAGES[challenge.topic]}
          alt={TOPIC_LABELS[challenge.topic]}
          fill
          style={{ objectFit: 'cover', opacity: 0.65 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/90" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded border text-blue-400 bg-blue-400/10 border-blue-400/20">
            {TOPIC_LABELS[challenge.topic]}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded border text-zinc-400 bg-zinc-800 border-zinc-700">
            {TYPE_LABELS[challenge.type]}
          </span>
        </div>
        <h2 className="text-base font-semibold text-zinc-100">{challenge.title}</h2>
        <DifficultyStars difficulty={challenge.difficulty} />
        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
          <Lightning size={11} weight="bold" />
          {challenge.xp_reward} XP reward
        </div>
      </div>

      <div
        className="text-sm text-zinc-400 leading-relaxed [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-purple-300 [&_code]:text-xs [&_pre]:bg-zinc-800 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-xs [&_pre]:overflow-x-auto [&_strong]:text-zinc-300"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(challenge.description) }}
      />

      {challenge.tags.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-zinc-600 uppercase tracking-wide flex items-center gap-1">
            <Tag size={10} /> Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {progress && (
        <div className="mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-1 text-xs text-zinc-500">
          {progress.status === 'solved' && (
            <span className="text-emerald-400">✓ Solved</span>
          )}
          <span>{progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}</span>
          {progress.best_time && <span>Best time: {progress.best_time}s</span>}
        </div>
      )}
    </div>
  )
}
