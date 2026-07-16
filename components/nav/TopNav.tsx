'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CodeBlock,
  Lightning,
  Fire,
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

type NavUser = {
  username: string
  xp: number
  streak: number
}

export function TopNav({ user }: { user: NavUser | null }) {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <nav className="h-[52px] bg-zinc-950 border-b border-zinc-900 flex items-center px-5 flex-shrink-0 z-50">
      <Link
        href={user ? '/challenges' : '/'}
        className="flex items-center gap-1.5 text-white font-bold tracking-tight text-[15px]"
      >
        <div className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <CodeBlock size={14} weight="bold" className="text-white" />
        </div>
        Code Forge
      </Link>

      <div className="ml-auto flex items-center gap-2.5">
        {user && (
          <>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-[11px] font-semibold text-amber-400">
              <Lightning size={11} weight="bold" />
              {user.xp.toLocaleString()} XP
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-[11px] font-semibold text-red-400">
              <Fire size={11} weight="bold" />
              {user.streak}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
                {user.username.charAt(0).toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => router.push(`/profile/${user.username}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <UserCircle size={15} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/leaderboard')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Trophy size={15} />
                  Leaderboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="flex items-center gap-2 text-red-400 cursor-pointer"
                >
                  <SignOut size={15} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </nav>
  )
}
