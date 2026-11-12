type Props = {
  topic: string
  className?: string
}

function LetterMark({ label, bg, fg, text, className }: { label: string; bg: string; fg: string; text: string; className?: string }) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 64 64" className={className}>
      <rect width="64" height="64" rx="4" fill={bg} />
      <text x="59" y="57" textAnchor="end" fill={fg} fontFamily="var(--font-geist), system-ui, sans-serif" fontWeight="700" fontSize="28" letterSpacing="-1">
        {text}
      </text>
    </svg>
  )
}

export function TopicLogo({ topic, className }: Props) {
  if (topic === 'js') return <LetterMark label="JavaScript logo" bg="#F7DF1E" fg="#1a1714" text="JS" className={className} />
  if (topic === 'ts') return <LetterMark label="TypeScript logo" bg="#3178C6" fg="#ffffff" text="TS" className={className} />
  if (topic === 'react') {
    return (
      <svg role="img" aria-label="React logo" viewBox="-11.5 -10.23 23 20.46" className={className}>
        <circle r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    )
  }
  return null
}
