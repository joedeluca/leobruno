"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import PoemDisplay from "./PoemDisplay"
import PoemAudioPlayer from "./PoemAudioPlayer"

interface PoemSlideOutProps {
  isOpen: boolean
  onClose: () => void
  title: string
  author: string
  content: string
  audioUrl?: string
}

export default function PoemSlideOut({
  isOpen,
  onClose,
  title,
  author,
  content,
  audioUrl,
}: PoemSlideOutProps) {
  const slideOutRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const isAnimatingOut = useRef(false)

  useEffect(() => {
    if (isOpen && !shouldRender) {
      // Mount the component and animate in
      setShouldRender(true)
      isAnimatingOut.current = false
    } else if (!isOpen && shouldRender && !isAnimatingOut.current) {
      // Start animating out
      isAnimatingOut.current = true

      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        })
      }
      if (slideOutRef.current) {
        gsap.to(slideOutRef.current, {
          x: "100%",
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            setShouldRender(false)
            isAnimatingOut.current = false
          },
        })
      }
    }
  }, [isOpen, shouldRender])

  // Animate in when component mounts
  useEffect(() => {
    if (shouldRender && isOpen && slideOutRef.current && overlayRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 })
      gsap.set(slideOutRef.current, { x: "100%" })

      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      })

      gsap.to(slideOutRef.current, {
        x: 0,
        duration: 0.4,
        ease: "power2.out",
      })
    }
  }, [shouldRender, isOpen])

  if (!shouldRender) return null

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40 opacity-0"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div
        ref={slideOutRef}
        className="fixed top-0 right-0 h-full w-full lg:w-[600px] bg-zinc-50 z-50 transform translate-x-full shadow-2xl overflow-y-auto"
      >
        {/* Header with glassy effect */}
        <div
          className="px-6 lg:px-8 py-6 sticky top-0 z-10"
          style={{
            backgroundColor: "rgba(250, 250, 250, 0.7)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
          }}
        >
          <h2
            className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-2"
            style={{ fontFamily: '"Schnyder S", Georgia, serif' }}
          >
            {title}
          </h2>
          <div className="flex items-center gap-3">
            <div
              className="text-sm text-zinc-600 uppercase tracking-wide"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              BY {author.toUpperCase()}
            </div>
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="text-xs text-zinc-500 hover:text-tiepolo-pink-700 transition-colors uppercase tracking-wide"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              {showLineNumbers ? "Hide" : "Show"} Line Numbers
            </button>
          </div>
        </div>

        {/* Close button - positioned absolutely */}
        <button
          onClick={onClose}
          className="fixed top-6 right-6 lg:right-8 text-zinc-600 hover:text-zinc-900 transition-colors text-3xl leading-none z-20"
          aria-label="Close"
        >
          ×
        </button>

        {/* Content */}
        <div className="px-6 lg:px-8 py-8">
          <PoemAudioPlayer audioUrl={audioUrl} />
          <PoemDisplay content={content} showLineNumbers={showLineNumbers} />
        </div>
      </div>
    </>
  )
}
