"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"

interface ToolsDropdownProps {
  showLineNumbers: boolean
  showAudioPlayer: boolean
  onToggleLineNumbers: () => void
  onToggleAudioPlayer: () => void
  align?: "left" | "right"
}

export default function ToolsDropdown({
  showLineNumbers,
  showAudioPlayer,
  onToggleLineNumbers,
  onToggleAudioPlayer,
  align = "left",
}: ToolsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (!dropdownRef.current || !contentRef.current) return

    if (isOpen) {
      // Make visible first
      gsap.set(dropdownRef.current, { opacity: 1 })
      // Animate open
      gsap.to(dropdownRef.current, {
        height: "auto",
        duration: 0.3,
        ease: "power2.out",
      })
      gsap.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      })
    } else {
      // Animate close
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: "power2.in",
      })
      gsap.to(dropdownRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        delay: 0.1,
      })
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Tools Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-zinc-400 hover:text-tiepolo-pink-500 transition-colors uppercase tracking-wide flex items-center gap-1"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        Audio / Line Numbers
        <svg
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className={`absolute top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden z-10 ${
          align === "right" ? "right-0" : "left-0"
        }`}
        style={{ height: 0, opacity: 0, minWidth: "200px" }}
      >
        <div
          ref={contentRef}
          className="py-2 px-3 space-y-2"
          style={{ opacity: 0, transform: "translateY(-10px)" }}
        >
          <button
            onClick={onToggleAudioPlayer}
            className="w-full text-left text-xs text-zinc-400 hover:text-zinc-100 transition-colors py-2 px-3 rounded hover:bg-zinc-800"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            <div className="flex items-center justify-between">
              <span>{showAudioPlayer ? "Hide" : "Show"} Audio Player</span>
              {showAudioPlayer && (
                <svg
                  className="w-4 h-4 text-tiepolo-pink-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
          <button
            onClick={onToggleLineNumbers}
            className="w-full text-left text-xs text-zinc-400 hover:text-zinc-100 transition-colors py-2 px-3 rounded hover:bg-zinc-800"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            <div className="flex items-center justify-between">
              <span>{showLineNumbers ? "Hide" : "Show"} Line Numbers</span>
              {showLineNumbers && (
                <svg
                  className="w-4 h-4 text-tiepolo-pink-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
