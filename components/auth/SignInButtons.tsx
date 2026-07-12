'use client'

import { useSignIn } from '@clerk/nextjs'
import { GithubLogo, GoogleLogo } from '@phosphor-icons/react'

export function SignInButtons() {
  const { signIn } = useSignIn()

  const signInWith = async (strategy: 'oauth_github' | 'oauth_google') => {
    if (!signIn) return
    await signIn.sso({
      strategy,
      redirectCallbackUrl: `${window.location.origin}/sso-callback`,
      redirectUrl: '/challenges',
    })
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <button
        onClick={() => signInWith('oauth_github')}
        className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
      >
        <GithubLogo size={18} weight="fill" />
        Continue with GitHub
      </button>
      <button
        onClick={() => signInWith('oauth_google')}
        className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
      >
        <GoogleLogo size={18} weight="fill" />
        Continue with Google
      </button>
    </div>
  )
}
