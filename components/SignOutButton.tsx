"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
      style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
    >
      Sign out
    </button>
  )
}
