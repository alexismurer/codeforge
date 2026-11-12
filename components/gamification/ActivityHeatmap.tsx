type DayActivity = {
  date: string
  count: number
}

type Props = {
  activity: DayActivity[]
}

const SCALE = ['bg-surface-2', 'bg-ember/25', 'bg-ember/55', 'bg-ember']

function getIntensity(count: number): string {
  if (count === 0) return SCALE[0]
  if (count === 1) return SCALE[1]
  if (count <= 3) return SCALE[2]
  return SCALE[3]
}

export function ActivityHeatmap({ activity }: Props) {
  const today = new Date()
  const days: { date: string; count: number }[] = []

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const found = activity.find((a) => a.date === dateStr)
    days.push({ date: dateStr, count: found?.count ?? 0 })
  }

  const totalSolves = activity.reduce((sum, a) => sum + a.count, 0)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between font-mono text-[11px] text-faint">
        <span><span className="text-foreground">{totalSolves}</span> {totalSolves === 1 ? 'solve' : 'solves'} in the last 12 weeks</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {SCALE.map((cls) => (
            <div key={cls} className={`size-2.5 rounded-[2px] ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="grid w-fit grid-cols-[repeat(12,auto)] gap-1">
        {Array.from({ length: 12 }, (_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {days.slice(weekIdx * 7, weekIdx * 7 + 7).map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} solve${day.count !== 1 ? 's' : ''}`}
                className={`size-4 cursor-default rounded-[2px] transition-transform hover:scale-125 ${getIntensity(day.count)} ${day.count > 3 ? 'shadow-[0_0_8px_-1px_var(--ember)]' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
