const LABELS = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Legendary']

const BAR_HEAT = [
  'bg-ember/60',
  'bg-ember/80',
  'bg-ember',
  'bg-[color-mix(in_oklch,var(--ember),var(--molten)_50%)]',
  'bg-molten',
]

export function DifficultyHeat({ difficulty, showLabel = true }: { difficulty: number; showLabel?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2"
      aria-label={`Difficulty ${difficulty} of 5: ${LABELS[difficulty]}`}
      title={LABELS[difficulty]}
    >
      <span className="flex items-end gap-[3px]" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < difficulty
          return (
            <span
              key={i}
              data-filled={filled}
              className={`w-[3px] rounded-[1px] ${filled ? BAR_HEAT[difficulty - 1] : 'bg-surface-2'}`}
              style={{ height: 6 + i * 2 }}
            />
          )
        })}
      </span>
      {showLabel && (
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {LABELS[difficulty]}
        </span>
      )}
    </span>
  )
}
