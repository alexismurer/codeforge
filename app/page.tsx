import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { CodeBlock } from '@phosphor-icons/react/dist/ssr'
import { SignInButtons } from '@/components/auth/SignInButtons'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/challenges')

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 lg:px-16">
      <div className="flex flex-col items-center lg:items-start gap-6 text-center lg:text-left max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <CodeBlock size={32} weight="bold" className="text-white" />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold text-white tracking-tight">Code Forge</h1>
          <p className="text-zinc-400 text-lg">
            Master JavaScript, TypeScript, and React through hands-on challenges.
            Write real code, run real tests, get AI feedback.
          </p>
        </div>
        <SignInButtons />
        <p className="text-zinc-600 text-xs">
          JS · TypeScript · React — more coming soon
        </p>
      </div>

      {/* Hero image — place generated image at public/images/hero.png (recommended 900×600) */}
      <div className="relative w-full max-w-xl h-[420px] rounded-2xl overflow-hidden hidden lg:block flex-shrink-0 bg-gradient-to-br from-indigo-950 via-zinc-900 to-purple-950">
        <Image
          src="/images/hero.png"
          alt="Code Forge — dark forge with glowing code"
          fill
          style={{ objectFit: 'cover', opacity: 0.85 }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent" />
      </div>
    </main>
  )
}
