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

type BadgeConfig = {
  icon: IconComponent
  iconColor: string
  iconBg: string
  cardBg: string
  cardBorder: string
  labelColor: string
  descColor: string
}

const BADGE_CONFIG: Record<string, BadgeConfig> = {
  'first-blood':   { icon: Sword,        iconColor: 'text-orange-400',  iconBg: 'bg-orange-900/60',  cardBg: 'bg-orange-950/30',  cardBorder: 'border-orange-800/40',  labelColor: 'text-orange-300',  descColor: 'text-orange-600'  },
  'on-fire':       { icon: Flame,         iconColor: 'text-amber-400',   iconBg: 'bg-amber-900/60',   cardBg: 'bg-amber-950/30',   cardBorder: 'border-amber-800/40',   labelColor: 'text-amber-300',   descColor: 'text-amber-600'   },
  'unstoppable':   { icon: Crown,         iconColor: 'text-amber-400',   iconBg: 'bg-amber-900/60',   cardBg: 'bg-amber-950/30',   cardBorder: 'border-amber-800/40',   labelColor: 'text-amber-300',   descColor: 'text-amber-600'   },
  'speed-demon':   { icon: Lightning,     iconColor: 'text-blue-400',    iconBg: 'bg-blue-900/60',    cardBg: 'bg-blue-950/30',    cardBorder: 'border-blue-800/40',    labelColor: 'text-blue-300',    descColor: 'text-blue-600'    },
  'perfectionist': { icon: Target,        iconColor: 'text-purple-400',  iconBg: 'bg-purple-900/60',  cardBg: 'bg-purple-950/30',  cardBorder: 'border-purple-800/40',  labelColor: 'text-purple-300',  descColor: 'text-purple-600'  },
  'type-wizard':   { icon: MagicWand,     iconColor: 'text-blue-400',    iconBg: 'bg-blue-900/60',    cardBg: 'bg-blue-950/30',    cardBorder: 'border-blue-800/40',    labelColor: 'text-blue-300',    descColor: 'text-blue-600'    },
  'hook-master':   { icon: Fish,          iconColor: 'text-cyan-400',    iconBg: 'bg-cyan-900/60',    cardBg: 'bg-cyan-950/30',    cardBorder: 'border-cyan-800/40',    labelColor: 'text-cyan-300',    descColor: 'text-cyan-600'    },
  'bug-slayer':    { icon: Bug,           iconColor: 'text-green-400',   iconBg: 'bg-green-900/60',   cardBg: 'bg-green-950/30',   cardBorder: 'border-green-800/40',   labelColor: 'text-green-300',   descColor: 'text-green-600'   },
  'refactor-king': { icon: Wrench,        iconColor: 'text-indigo-400',  iconBg: 'bg-indigo-900/60',  cardBg: 'bg-indigo-950/30',  cardBorder: 'border-indigo-800/40',  labelColor: 'text-indigo-300',  descColor: 'text-indigo-600'  },
  'legendary':     { icon: Trophy,        iconColor: 'text-amber-400',   iconBg: 'bg-amber-900/60',   cardBg: 'bg-amber-950/30',   cardBorder: 'border-amber-800/40',   labelColor: 'text-amber-300',   descColor: 'text-amber-600'   },
  'century':       { icon: Medal,         iconColor: 'text-amber-400',   iconBg: 'bg-amber-900/60',   cardBg: 'bg-amber-950/30',   cardBorder: 'border-amber-800/40',   labelColor: 'text-amber-300',   descColor: 'text-amber-600'   },
  'no-hints':      { icon: Brain,         iconColor: 'text-emerald-400', iconBg: 'bg-emerald-900/60', cardBg: 'bg-emerald-950/30', cardBorder: 'border-emerald-800/40', labelColor: 'text-emerald-300', descColor: 'text-emerald-600' },
  'grinder':       { icon: Barbell,       iconColor: 'text-orange-400',  iconBg: 'bg-orange-900/60',  cardBg: 'bg-orange-950/30',  cardBorder: 'border-orange-800/40',  labelColor: 'text-orange-300',  descColor: 'text-orange-600'  },
  'dedicated':     { icon: Star,          iconColor: 'text-yellow-400',  iconBg: 'bg-yellow-900/60',  cardBg: 'bg-yellow-950/30',  cardBorder: 'border-yellow-800/40',  labelColor: 'text-yellow-300',  descColor: 'text-yellow-600'  },
  'marathon':      { icon: CalendarCheck, iconColor: 'text-rose-400',    iconBg: 'bg-rose-900/60',    cardBg: 'bg-rose-950/30',    cardBorder: 'border-rose-800/40',    labelColor: 'text-rose-300',    descColor: 'text-rose-600'    },
  'js-master':     { icon: FileJs,        iconColor: 'text-yellow-400',  iconBg: 'bg-yellow-900/60',  cardBg: 'bg-yellow-950/30',  cardBorder: 'border-yellow-800/40',  labelColor: 'text-yellow-300',  descColor: 'text-yellow-600'  },
  'react-master':  { icon: Atom,          iconColor: 'text-cyan-400',    iconBg: 'bg-cyan-900/60',    cardBg: 'bg-cyan-950/30',    cardBorder: 'border-cyan-800/40',    labelColor: 'text-cyan-300',    descColor: 'text-cyan-600'    },
  'full-stack':    { icon: Stack,         iconColor: 'text-violet-400',  iconBg: 'bg-violet-900/60',  cardBg: 'bg-violet-950/30',  cardBorder: 'border-violet-800/40',  labelColor: 'text-violet-300',  descColor: 'text-violet-600'  },
  'quiz-ace':      { icon: CheckSquare,   iconColor: 'text-teal-400',    iconBg: 'bg-teal-900/60',    cardBg: 'bg-teal-950/30',    cardBorder: 'border-teal-800/40',    labelColor: 'text-teal-300',    descColor: 'text-teal-600'    },
  'clean-coder':   { icon: Sparkle,       iconColor: 'text-sky-400',     iconBg: 'bg-sky-900/60',     cardBg: 'bg-sky-950/30',     cardBorder: 'border-sky-800/40',     labelColor: 'text-sky-300',     descColor: 'text-sky-600'     },
  'hard-mode':     { icon: ShieldCheck,   iconColor: 'text-red-400',     iconBg: 'bg-red-900/60',     cardBg: 'bg-red-950/30',     cardBorder: 'border-red-800/40',     labelColor: 'text-red-300',     descColor: 'text-red-600'     },
  'nightmare':     { icon: Skull,         iconColor: 'text-rose-400',    iconBg: 'bg-rose-900/60',    cardBg: 'bg-rose-950/30',    cardBorder: 'border-rose-800/40',    labelColor: 'text-rose-300',    descColor: 'text-rose-600'    },
  'rising-star':   { icon: TrendUp,       iconColor: 'text-indigo-400',  iconBg: 'bg-indigo-900/60',  cardBg: 'bg-indigo-950/30',  cardBorder: 'border-indigo-800/40',  labelColor: 'text-indigo-300',  descColor: 'text-indigo-600'  },
  'elite':         { icon: DiamondsFour,  iconColor: 'text-purple-400',  iconBg: 'bg-purple-900/60',  cardBg: 'bg-purple-950/30',  cardBorder: 'border-purple-800/40',  labelColor: 'text-purple-300',  descColor: 'text-purple-600'  },
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
        const config = BADGE_CONFIG[badge.slug]
        if (!config) return null

        const { icon: Icon, iconColor, iconBg, cardBg, cardBorder, labelColor, descColor } = config

        return (
          <div
            key={badge.slug}
            title={earned ? badge.description : `Locked: ${badge.description}`}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-colors ${
              earned ? `${cardBg} ${cardBorder}` : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${earned ? iconBg : 'bg-zinc-800'}`}>
              {earned ? (
                <Icon size={20} weight="bold" className={iconColor} />
              ) : (
                <Lock size={16} className="text-zinc-600" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-[10px] font-semibold leading-tight ${earned ? labelColor : 'text-zinc-600'}`}>
                {badge.label}
              </span>
              <span className={`text-[9px] leading-tight ${earned ? descColor : 'text-zinc-700'}`}>
                {badge.description}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
