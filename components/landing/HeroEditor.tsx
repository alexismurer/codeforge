'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/lib/motion'

const SOURCE = `export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait = 200,
) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}`

const KEYWORDS = new Set(['export', 'function', 'extends', 'let', 'return', 'typeof', 'const'])
const TYPES = new Set(['T', 'ReturnType', 'Parameters', 'any', 'void', 'undefined'])
const CALLS = new Set(['debounce', 'clearTimeout', 'setTimeout', 'fn'])

function tokenize(src: string): { text: string; cls: string }[] {
  return (src.match(/[A-Za-z_]\w*|\d+|\s+|=>|\.\.\.|[^\sA-Za-z_\d]/g) ?? []).map((text) => {
    if (KEYWORDS.has(text)) return { text, cls: 'text-ember' }
    if (TYPES.has(text)) return { text, cls: 'text-[#e6d3b3]' }
    if (CALLS.has(text)) return { text, cls: 'text-foreground' }
    if (/^\d+$/.test(text)) return { text, cls: 'text-molten' }
    if (/^[A-Za-z_]/.test(text)) return { text, cls: 'text-[#d9cbb8]' }
    return { text, cls: 'text-faint' }
  })
}

const TOKENS = tokenize(SOURCE)

const TESTS = ['fires once after the wait', 'resets the timer on each call', 'forwards the latest arguments']

export function HeroEditor() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    const tokenEls = Array.from(root.querySelectorAll<HTMLElement>('[data-token]'))
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-test]'))
    const sparks = Array.from(root.querySelectorAll<HTMLElement>('[data-spark]'))
    const status = root.querySelector<HTMLElement>('[data-status]')!
    const offsets: number[] = []
    let acc = 0
    for (const t of TOKENS) { offsets.push(acc); acc += t.text.length }

    const typed = { n: 0 }
    const render = () => {
      const n = Math.floor(typed.n)
      tokenEls.forEach((el, i) => {
        const full = TOKENS[i].text
        const visible = Math.max(0, Math.min(full.length, n - offsets[i]))
        if (el.textContent!.length !== visible) el.textContent = full.slice(0, visible)
      })
    }
    const setRows = (state: 'pending' | 'pass') => rows.forEach((r) => { r.dataset.state = state })

    const ctx = gsap.context(() => {
      const reset = () => {
        setRows('pending')
        status.textContent = 'typing…'
        typed.n = 0
        render()
      }
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.8, delay: 0.6, onStart: reset, onRepeat: reset })
      tl.to(typed, { n: acc, duration: 2.8, ease: 'none', onUpdate: render })
        .call(() => { status.textContent = 'running 3 tests' }, [], '+=0.3')
      rows.forEach((row, i) => {
        tl.call(() => { row.dataset.state = 'pass' }, [], `+=${i === 0 ? 0.45 : 0.22}`)
      })
      tl.call(() => { status.textContent = '3/3 passing' })
        .fromTo(
          sparks,
          { x: 0, y: 0, opacity: 1, scale: 1 },
          {
            x: () => gsap.utils.random(-140, 140),
            y: () => gsap.utils.random(-170, -40),
            opacity: 0,
            scale: () => gsap.utils.random(0.3, 1.2),
            duration: () => gsap.utils.random(0.7, 1.2),
            ease: 'power2.out',
            stagger: 0.01,
            immediateRender: false,
          },
          '<'
        )
        .fromTo('[data-flash]', { opacity: 0.55 }, { opacity: 0, duration: 0.9, ease: 'power2.out', immediateRender: false }, '<')
    }, root)

    return () => {
      ctx.revert()
      typed.n = acc
      render()
      setRows('pass')
      status.textContent = '3/3 passing'
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-hidden rounded-lg border border-border bg-card/90 shadow-[0_40px_120px_-40px_oklch(0.70_0.19_45/45%)] backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-surface-2" />
        <span className="size-2.5 rounded-full bg-surface-2" />
        <span className="size-2.5 rounded-full bg-surface-2" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground">debounce.ts</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-faint">TS · 200 XP</span>
      </div>

      <pre className="min-h-[248px] overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-[1.75]">
        <code>
          {TOKENS.map((t, i) => (
            <span key={i} data-token className={t.cls}>
              {t.text}
            </span>
          ))}
          <span className="ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] animate-pulse bg-ember motion-reduce:animate-none" />
        </code>
      </pre>

      <div className="relative border-t border-border bg-background/60 px-5 py-3">
        <div data-flash className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_100%,var(--ember),transparent)] opacity-0" />
        <div className="relative mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className="text-faint">Tests</span>
          <span data-status className="text-muted-foreground">3/3 passing</span>
        </div>
        <ul className="relative flex flex-col gap-1.5">
          {TESTS.map((name) => (
            <li key={name} data-test data-state="pass" className="group flex items-center gap-3 font-mono text-[11.5px]">
              <span className="w-10 text-[10px] font-semibold tracking-wider text-faint group-data-[state=pass]:text-success">
                <span className="group-data-[state=pass]:hidden">····</span>
                <span className="hidden group-data-[state=pass]:inline">PASS</span>
              </span>
              <span className="text-muted-foreground transition-colors group-data-[state=pass]:text-foreground">{name}</span>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute left-1/2 top-1/2">
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              data-spark
              className={`absolute block rounded-full opacity-0 ${i % 3 === 0 ? 'size-1.5 bg-molten' : i % 3 === 1 ? 'size-1 bg-ember' : 'size-[3px] bg-[#fff3dc]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
