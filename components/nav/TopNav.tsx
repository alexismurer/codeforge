'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Fire,
  Lightning,
  UserCircle,
  Trophy,
  SignOut,
} from '@phosphor-icons/react'
import { useClerk } from '@clerk/nextjs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CountUp } from '@/components/motion/CountUp'

type NavUser = {
  username: string
  xp: number
  streak: number
}

const LINKS = [
  { href: '/challenges', label: 'Challenges' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

const ITEM_CLASS =
  'flex cursor-pointer items-center gap-2 text-muted-foreground focus:bg-surface-2 focus:text-foreground'

export function TopNav({ user }: { user: NavUser | null }) {
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 flex h-[52px] flex-shrink-0 items-center gap-6 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-5">
      <Link
        href={user ? '/challenges' : '/'}
        className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-[-0.02em] text-foreground"
      >
        <span className="flex size-[24px] items-center justify-center rounded-[5px] bg-ember text-primary-foreground">
          <Fire size={14} weight="fill" />
        </span>
        <span className="hidden sm:inline">Code Forge</span>
      </Link>

      {user && (
        <div className="hidden items-center gap-5 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                isActive(l.href) ? 'text-foreground' : 'text-faint hover:text-muted-foreground'
              }`}
            >
              <span className={`size-1 rounded-full ${isActive(l.href) ? 'bg-ember' : 'bg-transparent'}`} />
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {user && (
          <>
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 font-mono text-[11px] text-molten">
              <Lightning size={12} weight="fill" />
              <CountUp value={user.xp} />
              <span className="text-faint">XP</span>
            </div>
            <div
              className={`flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[11px] ${
                user.streak > 0
                  ? 'border-ember/40 bg-ember/10 text-ember shadow-[0_0_16px_-4px_var(--ember)]'
                  : 'border-border bg-card text-faint'
              }`}
              title={`${user.streak} day streak`}
            >
              <Fire size={12} weight="fill" />
              {user.streak}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-surface-2 font-display text-xs font-semibold text-ember transition-colors hover:border-ember/50">
                {user.username.charAt(0).toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-border bg-card text-muted-foreground shadow-2xl shadow-black/50">
                <div className="px-2 py-1.5 font-mono text-[11px] text-faint">@{user.username}</div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.username}`)} className={ITEM_CLASS}>
                  <UserCircle size={15} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/leaderboard')} className={ITEM_CLASS}>
                  <Trophy size={15} />
                  Leaderboard
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="flex cursor-pointer items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <SignOut size={15} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </nav>
  )
}
