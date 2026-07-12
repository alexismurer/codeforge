'use client'

import { useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

type Props = {
  value: string
  onChange: (value: string) => void
  language: 'javascript' | 'typescript'
  height?: string
}

export function CodeEditor({ value, onChange, language, height = '100%' }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance
  }

  return (
    <MonacoEditor
      height={height}
      language={language}
      value={value}
      theme="vs-dark"
      onChange={(v) => onChange(v ?? '')}
      onMount={handleMount}
      options={{
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        padding: { top: 16 },
        tabSize: 2,
        wordWrap: 'on',
        overviewRulerLanes: 0,
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
      }}
    />
  )
}
