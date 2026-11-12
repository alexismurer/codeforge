import { auth } from '@clerk/nextjs/server'
import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { code, failingTests, challengeTitle, challengeDescription, aiContext } =
    await request.json()

  const systemPrompt = `You are a coding mentor for Code Forge, a platform for learning JavaScript, TypeScript, and React.

Your role: give a helpful HINT, not a solution. Guide the student toward the answer without writing their code for them.

Rules:
- Point to the concept or approach they're missing
- You may show a short illustrative snippet using a DIFFERENT example (not the actual solution)
- Do NOT write the full solution
- Keep your response under 150 words
- Be encouraging and specific

Challenge context: ${aiContext}`

  const userMessage = `Challenge: ${challengeTitle}

Description: ${challengeDescription}

Student's current code:
\`\`\`
${code}
\`\`\`

Failing tests:
${failingTests.join('\n')}

Give me a hint.`

  const stream = await groq.chat.completions.create({
    model: 'qwen/qwen3.8-27b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    stream: true,
    max_tokens: 300,
    temperature: 0.4,
    reasoning_effort: 'none',
    reasoning_format: 'hidden',
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
