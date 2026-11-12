'use client'

import { useRef } from 'react'
import { ArrowsOut, X } from '@phosphor-icons/react'

type Props = { code: string }

export function CodeBlock({ code }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openModal = () => dialogRef.current?.showModal()
  const closeModal = () => dialogRef.current?.close()

  return (
    <div className="relative group my-2">
      <pre className="whitespace-pre-wrap break-words rounded-[4px] border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
      <button
        onClick={openModal}
        aria-label="Expand code"
        className="absolute right-2 top-2 rounded-[4px] border border-border bg-surface-2 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
      >
        <ArrowsOut size={12} />
      </button>
      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) closeModal() }}
        onCancel={closeModal}
        className="backdrop:bg-black/70 backdrop:backdrop-blur-sm bg-transparent p-0 max-w-3xl w-full rounded-md shadow-2xl outline-none m-auto"
      >
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="eyebrow">Code</span>
            <button
              onClick={closeModal}
              aria-label="Close"
              className="rounded-[4px] p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
          <pre className="max-h-[70vh] overflow-auto bg-background p-4 font-mono text-sm leading-relaxed text-foreground/90">
            <code>{code}</code>
          </pre>
        </div>
      </dialog>
    </div>
  )
}
