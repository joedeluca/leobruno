"use client"

import { useEffect } from "react"

export default function ReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/newsletter/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
  }, [slug])

  return null
}
