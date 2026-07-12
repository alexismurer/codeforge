import { Lock } from '@phosphor-icons/react/dist/ssr'
import { badgeDefinitions } from '@/lib/badges'

type Props = {
  earnedSlugs: string[]
  limit?: number
}

export function BadgeShelf({ earnedSlugs, limit }: Props) {
  const badges = limit ? badgeDefinitions.slice(0, limit) : badgeDefinitions
  const earnedSet = new Set(earnedSlugs)

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {badges.map((badge) => {
        const earned = earnedSet.has(badge.slug)
        return (
          <div
            key={badge.slug}
            title={earned ? badge.description : `Locked: ${badge.description}`}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-colors ${
              earned
                ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
              earned ? 'bg-indigo-900/60' : 'bg-zinc-800'
            }`}>
              {earned ? getBadgeEmoji(badge.slug) : <Lock size={14} className="text-zinc-600" />}
            </div>
            <span className="text-[10px] font-medium leading-tight">{badge.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function getBadgeEmoji(slug: string): string {
  const map: Record<string, string> = {
    'first-blood': '⚔️',
    'on-fire': '🔥',
    'unstoppable': '💪',
    'speed-demon': '⚡',
    'perfectionist': '✨',
    'type-wizard': '🧙',
    'hook-master': '🎣',
    'bug-slayer': '🐛',
    'refactor-king': '👑',
    'legendary': '🏆',
    'century': '💯',
    'no-hints': '🧠',
  }
  return map[slug] ?? '🏅'
}
