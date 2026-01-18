"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import gsap from "gsap"

const photos = ["/joedeluca0.jpg", "/joedeluca1.jpg"]

// Function to get a random photo
const getRandomPhoto = () => {
  return photos[Math.floor(Math.random() * photos.length)]
}

export default function Sidebar() {
  // Use lazy initialization to pick photo once on mount
  const [currentPhoto] = useState(getRandomPhoto)
  const [showContact, setShowContact] = useState(false)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle"
  )
  const [errorMessage, setErrorMessage] = useState("")
  const contactSectionRef = useRef<HTMLDivElement>(null)

  const MAX_CHARS = 10000 // Ridiculously high but safe
  const wordCount = message
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
  const charCount = message.length

  // GSAP animation for contact section
  useEffect(() => {
    if (!contactSectionRef.current) return

    if (showContact) {
      gsap.to(contactSectionRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      })
    } else {
      gsap.to(contactSectionRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      })
    }
  }, [showContact])

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value.slice(0, MAX_CHARS))
    // Reset status when user starts typing a new message
    if (sendStatus === "success" || sendStatus === "error") {
      setSendStatus("idle")
      setErrorMessage("")
    }
  }

  const handleSend = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    setSendStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        try {
          const error = await response.json()
          setErrorMessage(error.error || "Failed to send message")
        } catch {
          setErrorMessage("Failed to send message")
        }
        setSendStatus("error")
        return
      }

      setSendStatus("success")
      setMessage("")
    } catch (error) {
      setErrorMessage("Network error - please try again")
      setSendStatus("error")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <aside className="space-y-8">
      <div>
        <div className="mb-6">
          <Image
            src={currentPhoto}
            alt="Leo Bruno"
            width={400}
            height={400}
            className="w-full h-auto aspect-square object-cover"
            priority
          />
        </div>

        <p className="text-zinc-400 text-base leading-relaxed mb-4">
          <h3
            className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Welcome
          </h3>
          I do a lot of reading and writing in dark rooms illuminated by candles
          stuck in the tops of skulls. Add to that a lot of ink wells, ravens
          feathers, and about a million dark and stormy nights and you've got me
          pretty well mapped. I'm Leo.
        </p>

        <button
          onClick={() => setShowContact(!showContact)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm mb-4 flex items-center gap-2"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          {showContact ? "Hide" : "Read More & Contact"}
          <svg
            className={`w-3 h-3 transition-transform ${
              showContact ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showContact && (
          <div ref={contactSectionRef} style={{ opacity: 0 }}>
            <p className="text-zinc-400 text-base leading-relaxed mb-4">
              All of the content here is 100% me. No AI stuff. No personal
              assistant ghost writers.
            </p>
            <p className="text-zinc-400 text-base leading-relaxed mb-4">
              You can contact me below. If you want a response, be sure to
              include your name and email.
            </p>

            <div className="space-y-3">
              <span
                className="text-xs text-zinc-600"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount}/
                {MAX_CHARS} characters
              </span>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Message here.... If you have a lot to say, write elsewhere and paste."
                  className="w-full h-32 px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-700 transition-colors"
                  style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                  maxLength={MAX_CHARS}
                  spellCheck={false}
                  disabled={isSending}
                />
                {isSending && (
                  <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-tiepolo-pink-700 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {sendStatus === "error" && errorMessage && (
                <p
                  className="text-xs text-red-400"
                  style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                >
                  {errorMessage}
                </p>
              )}

              <div className="flex">
                <button
                  onClick={handleSend}
                  disabled={wordCount < 3 || isSending}
                  className={`px-4 py-3 w-full text-sm font-medium transition-all ${
                    wordCount < 3 || isSending
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : sendStatus === "success"
                      ? "bg-green-900 text-green-300"
                      : sendStatus === "error"
                      ? "bg-red-900 text-red-300"
                      : "bg-tiepolo-pink-700 text-zinc-950 hover:bg-tiepolo-pink-600"
                  }`}
                  style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                >
                  {isSending
                    ? "Sending..."
                    : sendStatus === "success"
                    ? "Sent!"
                    : sendStatus === "error"
                    ? "Failed - Try again"
                    : wordCount < 3
                    ? "3 Word Minimum"
                    : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-zinc-800 pt-6">
          <h3
            className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Leo Reads
          </h3>
          <Link
            href="/poems/the-red-wheelbarrow"
            className="text-zinc-300 hover:text-zinc-100 transition-colors text-base"
          >
            The Red Wheelbarrow
          </Link>
        </div>
      </div>
    </aside>
  )
}
