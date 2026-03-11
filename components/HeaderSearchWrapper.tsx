"use client"

import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"

export default function HeaderSearchWrapper() {
  const [query, setQuery] = useState("")
  const [displayCount, setDisplayCount] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const countRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
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

    const handleOpenSearch = () => handleOpen()

    window.addEventListener("updatePostCount", handlePostCountUpdate)
    window.addEventListener("clearSearch", handleClearSearch)
    window.addEventListener("openSearch", handleOpenSearch)

    return () => {
      window.removeEventListener("updatePostCount", handlePostCountUpdate)
      window.removeEventListener("clearSearch", handleClearSearch)
      window.removeEventListener("openSearch", handleOpenSearch)
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

  const handleOpen = () => {
    setIsExpanded(true)
    // Focus after state update renders the input
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleBlur = () => {
    if (!query) {
      setIsExpanded(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("")
      setIsExpanded(false)
    }
  }

  return (
    <div className="w-full h-full flex items-center px-6 gap-4">
      {isExpanded ? (
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Search..."
          className="flex-1 h-full bg-transparent border-none outline-none focus:ring-0 text-xl text-zinc-100 placeholder:text-zinc-600"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        />
      ) : (
        <button
          onClick={handleOpen}
          className="flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Search"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <line x1="10.2" y1="10.2" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div className="ml-auto flex items-center pl-4 border-l border-[#3A2E24] h-8">
        <span
          ref={countRef}
          className="text-sm font-medium whitespace-nowrap"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#E8DCC8', opacity: 0.45 }}
        >
          {displayCount} {displayCount === 1 ? "article" : "articles"}
        </span>
      </div>
    </div>
  )
}
