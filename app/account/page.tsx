import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase"
import SignOutButton from "@/components/SignOutButton"

export const metadata: Metadata = {
  title: "Your Account — Leo Bruno",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const firstName = (user.user_metadata?.first_name as string) || null
  const joinDate = user.created_at ? formatDate(user.created_at) : null

  return (
    <div className="w-full flex justify-center px-8 py-24">
      <div className="text-center" style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>

        <p className="text-xs uppercase tracking-wider mb-12" style={{ color: '#EDEAE4', letterSpacing: '0.15em' }}>
          Your Information
        </p>

        <h1
          className="mb-12 leading-none"
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            fontSize: 'clamp(5rem, 12vw, 9rem)',
            color: '#EDEAE4',
          }}
        >
          {firstName ? `Ciao, ${firstName}.` : "Ciao."}
        </h1>

        <ul className="space-y-4 text-sm" style={{ color: '#A8A5A0' }}>
          <li>{user.email}</li>
          {joinDate && <li>Member since {joinDate}</li>}
          <li>Active subscriber</li>
        </ul>

        <div className="mt-16">
          <SignOutButton />
        </div>

      </div>
    </div>
  )
}
