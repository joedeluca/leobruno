"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

// Supabase redirects with the session in the URL fragment (#access_token=...).
// createBrowserClient writes the session as cookies so the SSR middleware can
// see it immediately when we navigate to /account.
export default function ConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")

    if (!accessToken || !refreshToken) {
      router.replace("/?auth_error=Missing+token")
      return
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          router.replace(`/?auth_error=${encodeURIComponent(error.message)}`)
        } else {
          router.push("/account")
        }
      })
  }, [router])

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
        color: "#888",
      }}
    >
      Signing you in…
    </div>
  )
}
