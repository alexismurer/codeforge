import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { CodeBlock } from '@phosphor-icons/react/dist/ssr'
import { SignInButtons } from '@/components/auth/SignInButtons'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/challenges')

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

      <SignInButtons />

      <p className="text-zinc-600 text-xs">
        JS · TypeScript · React — more coming soon
      </p>
    </main>
  )
}
