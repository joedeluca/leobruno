"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PoemLinkHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains("poem-link")) {
        e.preventDefault()
        const poemId = target.getAttribute("data-poem-id")
        if (poemId) {
          router.push(`/poems/${poemId}`)
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [router])

  return null
}
