import {
  Sword,
  Flame,
  Crown,
  Lightning,
  Target,
  MagicWand,
  Fish,
  Bug,
  Wrench,
  Trophy,
  Medal,
  Brain,
  Barbell,
  Star,
  CalendarCheck,
  FileJs,
  Atom,
  Stack,
  CheckSquare,
  Sparkle,
  ShieldCheck,
  Skull,
  TrendUp,
  DiamondsFour,
  Lock,
} from '@phosphor-icons/react/dist/ssr'
import { badgeDefinitions } from '@/lib/badges'

type IconComponent = React.ComponentType<{
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  className?: string
}>

const BADGE_ICONS: Record<string, IconComponent> = {
  'first-blood':   Sword,
  'on-fire':       Flame,
  'unstoppable':   Crown,
  'speed-demon':   Lightning,
  'perfectionist': Target,
  'type-wizard':   MagicWand,
  'hook-master':   Fish,
  'bug-slayer':    Bug,
  'refactor-king': Wrench,
  'legendary':     Trophy,
  'century':       Medal,
  'no-hints':      Brain,
  'grinder':       Barbell,
  'dedicated':     Star,
  'marathon':      CalendarCheck,
  'js-master':     FileJs,
  'react-master':  Atom,
  'full-stack':    Stack,
  'quiz-ace':      CheckSquare,
  'clean-coder':   Sparkle,
  'hard-mode':     ShieldCheck,
  'nightmare':     Skull,
  'rising-star':   TrendUp,
  'elite':         DiamondsFour,
}

type Props = {
  earnedSlugs: string[]
  limit?: number
}

export function BadgeShelf({ earnedSlugs, limit }: Props) {
  const badges = limit ? badgeDefinitions.slice(0, limit) : badgeDefinitions
  const earnedSet = new Set(earnedSlugs)

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {badges.map((badge) => {
        const earned = earnedSet.has(badge.slug)
        const Icon = BADGE_ICONS[badge.slug]
        if (!Icon) return null

        return (
          <div
            key={badge.slug}
            title={earned ? badge.description : `Locked: ${badge.description}`}
            className={`group flex flex-col items-center gap-2.5 rounded-md border p-3 text-center transition-colors ${
              earned ? 'border-ember/30 bg-card hover:border-ember/60' : 'border-border bg-card/50'
            }`}
          >
            <div
              className={`flex size-10 items-center justify-center rounded-md ${
                earned ? 'bg-ember/10 shadow-[inset_0_0_0_1px_oklch(0.70_0.19_45/25%)]' : 'bg-surface-2/60'
              }`}
            >
              {earned ? (
                <Icon size={20} weight="bold" className="text-ember transition-transform group-hover:scale-110" />
              ) : (
                <Lock size={15} className="text-faint" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-[11px] font-semibold leading-tight ${earned ? 'text-foreground' : 'text-faint'}`}>
                {badge.label}
              </span>
              <span className={`text-[9.5px] leading-tight ${earned ? 'text-muted-foreground' : 'text-faint/70'}`}>
                {badge.description}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
