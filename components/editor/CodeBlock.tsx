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
      <pre className="bg-zinc-800 p-3 rounded-lg text-xs font-mono text-zinc-300 overflow-hidden whitespace-pre">
        <code>{code}</code>
      </pre>
      <button
        onClick={openModal}
        aria-label="Expand code"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
      >
        <ArrowsOut size={12} />
      </button>
      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) closeModal() }}
        className="backdrop:bg-black/60 bg-transparent p-0 max-w-3xl w-full rounded-xl shadow-2xl outline-none"
      >
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <span className="text-xs text-zinc-500 font-mono">Code</span>
            <button
              onClick={closeModal}
              aria-label="Close"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <pre className="overflow-auto p-4 text-sm font-mono text-zinc-300 max-h-[70vh]">
            <code>{code}</code>
          </pre>
        </div>
      </dialog>
    </div>
  )
}
