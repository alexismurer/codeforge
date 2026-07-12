import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/nav/TopNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('username, xp, streak')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <TopNav user={profile} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
