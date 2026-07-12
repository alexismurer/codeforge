import { Star } from '@phosphor-icons/react/dist/ssr'

const LABELS = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Legendary']

export function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <span className="flex items-center gap-0.5" title={LABELS[difficulty]}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          weight={i < difficulty ? 'fill' : 'regular'}
          className={i < difficulty ? 'text-amber-400' : 'text-zinc-700'}
        />
      ))}
      <span className="ml-1 text-[11px] text-zinc-500">{LABELS[difficulty]}</span>
    </span>
  )
}
