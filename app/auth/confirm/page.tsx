"use client"

import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

// This page receives token_hash via the URL hash fragment (#).
// Fragments are never sent to the server and never prefetched by email clients,
// so the one-time token can't be consumed before the user clicks.
export default function ConfirmPage() {
  useEffect(() => {
    const hash = window.location.hash.slice(1) // remove leading #
    const params = new URLSearchParams(hash)
    const tokenHash = params.get("token_hash")
    const type = params.get("type") ?? "magiclink"

    if (!tokenHash) {
      window.location.href = "/?auth_error=Missing+token"
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: type as any })
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
