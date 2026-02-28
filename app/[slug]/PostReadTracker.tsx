"use client"

import { useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

export default function PostReadTracker({
  slug,
  title,
  type,
  url,
}: {
  slug: string
  title: string
  type: string
  url: string
}) {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      fetch("/api/reads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, type, url }),
      })
    })
  }, [slug, title, type, url])

  return null
}
