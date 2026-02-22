"use client"

import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

// Supabase always redirects with the session in the URL fragment (#access_token=...).
// This client-side page reads it and sets the session, then redirects to /account.
export default function ConfirmPage() {
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")

    if (!accessToken || !refreshToken) {
      window.location.href = "/?auth_error=Missing+token"
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          window.location.href = `/?auth_error=${encodeURIComponent(error.message)}`
        } else {
          window.location.href = "/account"
        }
      })
  }, [])

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
