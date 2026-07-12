import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GithubLogo, GoogleLogo, CodeBlock } from '@phosphor-icons/react/dist/ssr'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Authenticated users go straight to challenges
  if (user) redirect('/challenges')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const githubSignInUrl = `${supabaseUrl}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`)}`
  const googleSignInUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`)}`

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <CodeBlock size={32} weight="bold" className="text-white" />
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight">Code Forge</h1>
        <p className="text-zinc-400 text-lg max-w-md">
          Master JavaScript, TypeScript, and React through hands-on challenges.
          Write real code, run real tests, get AI feedback.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href={githubSignInUrl}
          className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"
        >
          <GithubLogo size={18} weight="fill" />
          Continue with GitHub
        </a>
        <a
          href={googleSignInUrl}
          className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"
        >
          <GoogleLogo size={18} weight="fill" />
          Continue with Google
        </a>
      </div>

      <p className="text-zinc-600 text-xs">
        JS · TypeScript · React — more coming soon
      </p>
    </main>
  )
}
