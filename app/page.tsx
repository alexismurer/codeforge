import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Fire, Flask, Lightbulb, TrendUp } from '@phosphor-icons/react/dist/ssr'
import { SignInButtons } from '@/components/auth/SignInButtons'
import { HeroEditor } from '@/components/landing/HeroEditor'
import { LandingMotion, Words } from '@/components/landing/LandingMotion'

const FEATURES = [
  {
    n: '01',
    icon: Flask,
    title: 'Real tests',
    body: 'Every challenge ships a test suite that runs in a sandbox in your browser. Green means it works.',
  },
  {
    n: '02',
    icon: Lightbulb,
    title: 'Hints, not answers',
    body: 'Stuck? The hint reads your code and failing tests, then nudges you without handing over the fix.',
  },
  {
    n: '03',
    icon: TrendUp,
    title: 'Heat that compounds',
    body: 'XP, levels, badges and streaks. Show up daily and watch the forge get hotter.',
  },
]

const TRACKS = ['Closures', 'Generics', 'Hooks', 'Promises', 'Reducers', 'Type guards', 'Event loop', 'Memoization']

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/challenges')

  return (
    <LandingMotion className="grain relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.70_0.19_45/22%),transparent)] blur-2xl"
      />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-[5px] bg-ember text-primary-foreground">
            <Fire size={16} weight="fill" />
          </span>
          <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">Code Forge</span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">JS · TS · React</span>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-24 pt-12 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div className="flex min-w-0 flex-col gap-8">
            <span data-intro className="eyebrow flex items-center gap-2">
              <span className="live-dot size-1.5 rounded-full bg-ember" />
              Hands-on coding challenges
            </span>
            <h1 className="font-display text-[clamp(2.75rem,7vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              <span className="block"><Words text="Forge real skills." /></span>
              <span className="block"><Words text="One failing test" className="ember-text" /></span>
              <span className="block"><Words text="at a time." className="ember-text" /></span>
            </h1>
            <p data-intro className="max-w-md text-[17px] leading-relaxed text-muted-foreground">
              Write real JavaScript, TypeScript and React. Run real tests. Get hints that don&apos;t spoil the answer.
            </p>
            <div data-intro>
              <SignInButtons />
            </div>
            <p data-intro className="font-mono text-[11px] text-faint">Free. No credit card. Just your keyboard.</p>
          </div>

          <div data-intro className="relative min-w-0">
            <HeroEditor />
          </div>
        </section>

        <section className="border-y border-border bg-card/40">
          <div className="mx-auto flex max-w-7xl gap-10 overflow-hidden px-4 py-4 font-mono text-[12px] uppercase tracking-[0.14em] text-faint sm:px-8 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            {TRACKS.map((t) => (
              <span key={t} className="flex shrink-0 items-center gap-10">
                {t}
                <span className="text-ember">/</span>
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <div data-reveal className="mb-12 flex flex-col gap-3">
            <span className="eyebrow">{'// How it works'}</span>
            <h2 className="max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Less watching. More shipping.
            </h2>
          </div>
          <div data-reveal className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {FEATURES.map(({ n, icon: Icon, title, body }) => (
              <div key={n} className="group flex flex-col gap-6 bg-background p-7 transition-colors hover:bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-faint">{n}</span>
                  <Icon size={22} className="text-ember transition-transform duration-300 group-hover:-translate-y-0.5" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-8">
          <div data-reveal className="relative flex flex-col items-start gap-8 overflow-hidden rounded-lg border border-border bg-card px-7 py-14 sm:px-14">
            <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-20 h-80 w-[600px] rounded-full bg-[radial-gradient(closest-side,oklch(0.70_0.19_45/30%),transparent)] blur-2xl" />
            <h2 className="relative max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              The anvil is hot. <span className="ember-text">Strike.</span>
            </h2>
            <div className="relative">
              <SignInButtons captcha={false} />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 font-mono text-[11px] text-faint sm:px-8">
          <span>© {new Date().getFullYear()} Code Forge</span>
          <span>Built for people who learn by doing.</span>
        </div>
      </footer>
    </LandingMotion>
  )
}
