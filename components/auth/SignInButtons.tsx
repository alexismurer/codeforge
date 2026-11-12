'use client'

import { useSignIn } from '@clerk/nextjs'
import { GithubLogo, GoogleLogo, ArrowRight } from '@phosphor-icons/react'

export function SignInButtons({ captcha = true }: { captcha?: boolean }) {
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
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      {captcha && <div id="clerk-captcha" />}
      <button
        onClick={() => signInWith('oauth_github')}
        className="ember-glow group flex cursor-pointer items-center justify-center gap-2.5 rounded-md bg-ember px-5 py-3 text-sm font-semibold text-primary-foreground transition-[filter,transform] hover:brightness-110 active:translate-y-px"
      >
        <GithubLogo size={18} weight="fill" />
        Continue with GitHub
        <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
      </button>
      <button
        onClick={() => signInWith('oauth_google')}
        className="flex cursor-pointer items-center justify-center gap-2.5 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/20 hover:bg-surface-2 active:translate-y-px"
      >
        <GoogleLogo size={18} weight="bold" />
        Continue with Google
      </button>
    </div>
  )
}
