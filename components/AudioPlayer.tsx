"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

export default function AudioPlayer() {
  const [isVisible, setIsVisible] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioIconRef = useRef<SVGSVGElement>(null)
  const closeIconRef = useRef<SVGSVGElement>(null)

  // Show player animation
  const showPlayer = () => {
    if (
      !playerRef.current ||
      !buttonRef.current ||
      !audioIconRef.current ||
      !closeIconRef.current
    )
      return

    const tl = gsap.timeline({
      onComplete: () => setIsVisible(true),
    })

    const buttonRect = buttonRef.current.getBoundingClientRect()

    // Calculate where close button should be (right top corner of player with padding)
    const targetX = window.innerWidth - 48 // 48px from right edge (32px button + 16px padding)
    const targetY = window.innerHeight - 120 + 24 // Top of player + 24px padding

    tl.to(audioIconRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: "power2.in",
    })
      .to(
        buttonRef.current,
        {
          x: targetX - buttonRect.left - buttonRect.width / 2,
          y: targetY - buttonRect.top - buttonRect.height / 2,
          scale: 0.5, // Shrink to 50% (32px from 64px)
          backgroundColor: "#0C0A08",
          duration: 0.3,
          ease: "power2.in",
        },
        "-=0.05"
      )
      // Slide player up from bottom
      .fromTo(
        playerRef.current,
        {
          y: "100%",
        },
        {
          y: 0,
          duration: 0.35,
          ease: "power3.out",
        },
        "-=0.1"
      )
      .to(
        closeIconRef.current,
        {
          opacity: 1,
          duration: 0.15,
          ease: "power2.out",
        },
        "-=0.3"
      )
  }

  // Hide player animation
  const hidePlayer = () => {
    if (
      !playerRef.current ||
      !buttonRef.current ||
      !audioIconRef.current ||
      !closeIconRef.current
    )
      return

    const tl = gsap.timeline({
      onComplete: () => setIsVisible(false),
    })

    // Fade out close icon
    tl.to(closeIconRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: "power2.in",
    })
      // Move button back to corner and scale up
      .to(
        playerRef.current,
        {
          y: "100%",
          duration: 0.4,
          ease: "power3.in",
        },
        "-=0.05"
      )
      .to(
        buttonRef.current,
        {
          x: 0,
          y: 0,
          scale: 1,
          backgroundColor: "#e8a8ab", // tiepolo-pink-700
          duration: 0.3,
          ease: "back.out(2)",
        },
        "-=0.2"
      )
      // Fade in audio icon
      .to(
        audioIconRef.current,
        {
          opacity: 1,
          duration: 0.15,
          ease: "power2.out",
        },
        "-=0.15"
      )
  }

  const handleToggle = () => {
    if (isVisible) {
      hidePlayer()
    } else {
      showPlayer()
    }
  }

  return (
    <div ref={containerRef} className="hidden lg:block">
      {/* Fixed Button - Bottom Right Corner */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isVisible
            ? "bg-zinc-950 hover:bg-zinc-900"
            : "bg-tiepolo-pink-700 !text-zinc-900 hover:bg-tiepolo-pink-600"
        }`}
        aria-label={isVisible ? "Close audio player" : "Open audio player"}
      >
        {/* Icon changes based on state */}
        {/* X icon when player is visible (close button) */}
        <svg
          ref={closeIconRef}
          className="w-5 h-5 text-zinc-100 absolute"
          fill="none"
          strokeWidth="2.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ opacity: 0 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>

        {/* Audio waves icon when player is hidden */}
        <svg
          ref={audioIconRef}
          className="w-6 h-6 text-zinc-950 absolute"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ opacity: 1 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
          />
        </svg>
      </button>

      {/* Audio Player - Fixed at Bottom */}
      <div
        ref={playerRef}
        className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-zinc-800 shadow-2xl"
        style={{
          height: "120px",
          transform: "translateY(100%)", // Start hidden below viewport
        }}
      >
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
          {/* Player content will go here */}
          <div className="flex items-center gap-6 flex-1">
            <div className="text-zinc-300">
              <div className="font-semibold">Track Title</div>
              <div className="text-sm text-zinc-500">Artist Name</div>
            </div>
          </div>

          {/* Controls placeholder */}
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Close button placeholder - button will move here */}
          <div className="w-16 flex justify-end">
            {/* This is where the circular button will land */}
          </div>
        </div>
      </div>
    </div>
  )
}
