import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/nav/TopNav'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/')

  const supabase = createClient()

  const baseUsername =
    clerkUser.username ??
    clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] ??
    `user_${clerkUser.id.slice(-6)}`

  // Create profile on first login; skip if already exists
  const { error } = await supabase
    .from('users')
    .upsert(
      { id: clerkUser.id, username: baseUsername, avatar_url: clerkUser.imageUrl },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  // If username collision (different user has same username), append Clerk ID suffix
  if (error?.code === '23505') {
    await supabase
      .from('users')
      .upsert(
        {
          id: clerkUser.id,
          username: `${baseUsername}_${clerkUser.id.slice(-4)}`,
          avatar_url: clerkUser.imageUrl,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
  }

  const { data: profile } = await supabase
    .from('users')
    .select('username, xp, streak')
    .eq('id', clerkUser.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNav user={profile} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
