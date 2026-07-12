import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  const topics = ['js', 'ts', 'react']
  const challenges = []

  for (const topic of topics) {
    const dir = join(process.cwd(), 'content', 'challenges', topic)
    try {
      const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
      for (const file of files) {
        const data = JSON.parse(readFileSync(join(dir, file), 'utf-8'))
        challenges.push(data)
      }
    } catch {
      console.log(`No challenges found for topic: ${topic}`)
    }
  }

  console.log(`Seeding ${challenges.length} challenges...`)

  const { error } = await supabase
    .from('challenges')
    .upsert(challenges, { onConflict: 'slug' })

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log('Seed complete.')
}

seed()
