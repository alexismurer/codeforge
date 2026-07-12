export default function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  return (
    <div className="p-8 text-zinc-400">
      Profile for @{params.username} — coming in Plan 4
    </div>
  )
}
