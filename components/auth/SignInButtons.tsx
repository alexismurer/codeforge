'use client'

import { useSignIn } from '@clerk/nextjs'
import { GithubLogo, GoogleLogo } from '@phosphor-icons/react'

export function SignInButtons() {
  const { signIn, isLoaded } = useSignIn()

  const signInWith = async (strategy: 'oauth_github' | 'oauth_google') => {
    if (!isLoaded || !signIn) return
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: '/challenges',
    })
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <button
        onClick={() => signInWith('oauth_github')}
        disabled={!isLoaded}
        className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <GithubLogo size={18} weight="fill" />
        Continue with GitHub
      </button>
      <button
        onClick={() => signInWith('oauth_google')}
        disabled={!isLoaded}
        className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <GoogleLogo size={18} weight="fill" />
        Continue with Google
      </button>
    </div>
  )
}
