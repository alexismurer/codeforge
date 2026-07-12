export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  return (
    <div className="p-8 text-zinc-400">
      Profile for @{username} — coming in Plan 4
    </div>
  )
}
