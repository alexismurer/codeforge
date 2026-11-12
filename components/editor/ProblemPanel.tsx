import type { ReactNode } from 'react'
import { Tag, Lightning } from '@phosphor-icons/react/dist/ssr'
import { DifficultyHeat } from '@/components/challenges/DifficultyHeat'
import { TopicLogo } from '@/components/challenges/TopicLogo'
import { CodeBlock } from '@/components/editor/CodeBlock'
import type { Challenge, ChallengeProgress } from '@/lib/types'

const TOPIC_LABELS: Record<string, string> = { js: 'JavaScript', ts: 'TypeScript', react: 'React' }
const TYPE_LABELS: Record<string, string> = {
  implement: 'Implement',
  'fix-bug': 'Fix Bug',
  refactor: 'Refactor',
  'multiple-choice': 'Quiz',
}

type Props = {
  challenge: Challenge
  progress: ChallengeProgress | null
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inlineHtml(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function renderDescription(md: string): ReactNode[] {
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = codeBlockRegex.exec(md)) !== null) {
    if (match.index > lastIndex) {
      const html = inlineHtml(md.slice(lastIndex, match.index))
      nodes.push(<span key={key++} dangerouslySetInnerHTML={{ __html: html }} />)
    }
    nodes.push(<CodeBlock key={key++} code={match[1]} />)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < md.length) {
    const html = inlineHtml(md.slice(lastIndex))
    nodes.push(<span key={key++} dangerouslySetInnerHTML={{ __html: html }} />)
  }

  return nodes
}

export function ProblemPanel({ challenge, progress }: Props) {
  return (
    <div className="flex flex-col gap-5 p-4 h-full overflow-y-auto">
      <div className="relative -mx-4 -mt-4 h-[96px] overflow-hidden bg-card">
        <div className="grid-lines absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.70_0.19_45/12%),var(--card)_95%)]" />
        <TopicLogo topic={challenge.topic} className="absolute right-4 top-1/2 size-12 -translate-y-1/2 drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
        <span className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {TOPIC_LABELS[challenge.topic]} / {TYPE_LABELS[challenge.type]}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground">{challenge.title}</h2>
        <div className="flex items-center justify-between">
          <DifficultyHeat difficulty={challenge.difficulty} />
          <span className="flex items-center gap-1 font-mono text-[11px] text-molten">
            <Lightning size={11} weight="fill" />
            {challenge.xp_reward} XP
          </span>
        </div>
      </div>

      <div className="text-[13.5px] leading-relaxed text-muted-foreground [&_:not(pre)>code]:rounded-[3px] [&_:not(pre)>code]:bg-surface-2 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-xs [&_:not(pre)>code]:text-molten [&_strong]:font-semibold [&_strong]:text-foreground">
        {renderDescription(challenge.description)}
      </div>

      {challenge.tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="eyebrow flex items-center gap-1.5">
            <Tag size={10} /> Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[3px] border border-border bg-background px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {progress && (
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4 font-mono text-[11px] text-faint">
          {progress.status === 'solved' && (
            <span className="text-ember">Solved</span>
          )}
          <span>{progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}</span>
          {progress.best_time && <span>Best time: {progress.best_time}s</span>}
        </div>
      )}
    </div>
  )
}
