"use client"

import { useEffect } from "react"

export default function ReadTracker({
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
    fetch("/api/reads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, type, url }),
    })
  }, [slug, title, type, url])

  return null
}
