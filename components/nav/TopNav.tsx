'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  CodeBlock,
  Trophy,
  UserCircle,
  Lightning,
  Fire,
} from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

type NavUser = {
  username: string
  xp: number
  streak: number
}

export function TopNav({ user }: { user: NavUser | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/challenges', icon: CodeBlock, label: 'Challenges' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    {
      href: user ? `/profile/${user.username}` : '/',
      icon: UserCircle,
      label: 'Profile',
    },
  ]

  return (
    <nav className="h-[52px] bg-zinc-950 border-b border-zinc-900 flex items-center px-5 gap-6 flex-shrink-0 z-50">
      <Link
        href={user ? '/challenges' : '/'}
        className="flex items-center gap-1.5 text-white font-bold tracking-tight text-[15px]"
      >
        <div className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <CodeBlock size={14} weight="bold" className="text-white" />
        </div>
        Code Forge
      </Link>

      {user && (
        <div className="flex gap-0.5 ml-2">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname.startsWith(href.split('/').slice(0, 2).join('/'))
                  ? 'bg-zinc-900 text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2.5">
        {user ? (
          <>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-[11px] font-semibold text-amber-400">
              <Lightning size={11} weight="bold" />
              {user.xp.toLocaleString()} XP
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-[11px] font-semibold text-red-400">
              <Fire size={11} weight="bold" />
              {user.streak}
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
            >
              {user.username.charAt(0).toUpperCase()}
            </button>
          </>
        ) : null}
      </div>
    </nav>
  )
}
