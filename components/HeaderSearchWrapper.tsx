"use client"

import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"

export default function HeaderSearchWrapper() {
  const [query, setQuery] = useState("")
  const [displayCount, setDisplayCount] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)
  const countRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    // Custom event to receive post count updates from page
    const handlePostCountUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ count: number }>
      const newCount = customEvent.detail.count

      // Cancel any ongoing animation
      if (animationRef.current) {
        animationRef.current.kill()
        animationRef.current = null
      }

      // If this is the initial load, drop down from off-screen
      if (!hasLoaded && countRef.current) {
        setHasLoaded(true)
        setDisplayCount(newCount)

        // Set initial position off-screen
        gsap.set(countRef.current, { y: -50, opacity: 0 })

        // Drop down animation
        gsap.to(countRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          delay: 0.2,
        })

        return
      }

      // For subsequent updates, just set the count directly (no counting animation)
      setDisplayCount(newCount)

      // Simple bounce effect
      if (countRef.current) {
        gsap.fromTo(
          countRef.current,
          { scale: 1 },
          {
            scale: 1.15,
            duration: 0.2,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          }
        )
      }
    }

    const handleClearSearch = () => {
      setQuery("")
    }

    window.addEventListener("updatePostCount", handlePostCountUpdate)
    window.addEventListener("clearSearch", handleClearSearch)

    return () => {
      window.removeEventListener("updatePostCount", handlePostCountUpdate)
      window.removeEventListener("clearSearch", handleClearSearch)
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [displayCount, hasLoaded])

  useEffect(() => {
    // Dispatch search event that page component can listen to
    const event = new CustomEvent("searchQuery", { detail: { query } })
    window.dispatchEvent(event)

    // Snap effect when starting to type
    if (query.length === 1 && countRef.current) {
      gsap.fromTo(
        countRef.current,
        { scale: 0.8 },
        { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      )
    }
  }, [query])

  return (
    <div className="w-full h-full flex items-center px-6 gap-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="Search..."
        className="flex-1 h-full bg-transparent border-none outline-none focus:ring-0 text-[30px] font-bold text-zinc-100 placeholder:text-zinc-700"
        style={{ fontFamily: '"Schnyder S", Georgia, serif' }}
      />
      <div className="flex items-center pl-4 border-l border-zinc-800 h-12">
        <span
          ref={countRef}
          className="text-base text-zinc-400 font-medium whitespace-nowrap"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          {displayCount} {displayCount === 1 ? "article" : "articles"}
        </span>
      </div>
    </div>
  )
}
