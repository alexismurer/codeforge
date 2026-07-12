type DayActivity = {
  date: string
  count: number
}

type Props = {
  activity: DayActivity[]
}

function getIntensity(count: number): string {
  if (count === 0) return 'bg-zinc-800'
  if (count === 1) return 'bg-emerald-900'
  if (count <= 3) return 'bg-emerald-700'
  return 'bg-emerald-500'
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
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{totalSolves} solves in the last 12 weeks</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {['bg-zinc-800', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500'].map((cls) => (
            <div key={cls} className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(12,1fr)] gap-1">
        {Array.from({ length: 12 }, (_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {days.slice(weekIdx * 7, weekIdx * 7 + 7).map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} solve${day.count !== 1 ? 's' : ''}`}
                className={`aspect-square rounded-sm ${getIntensity(day.count)} cursor-default`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
