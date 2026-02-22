"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleSubmit = async () => {
    if (!isValidEmail(email) || status === "loading") return

    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong.")
        setStatus("error")
        return
      }

      setStatus("success")
      setEmail("")

      // API returns a magic link — follow it to land on /account authenticated
      if (data.redirect) {
        window.location.href = data.redirect
      }

      // Redirect to /account — server already created the session token
      if (data.redirect) {
        window.location.href = data.redirect
      }
    } catch {
      setErrorMessage("Network error — please try again.")
      setStatus("error")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (status === "success" || status === "error") {
      setStatus("idle")
      setErrorMessage("")
    }
  }

  return (
    <div className="border-t border-zinc-800 pt-6 mt-6">
      <h3
        className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        Newsletter
      </h3>
      <p
        className="text-zinc-500 text-sm leading-relaxed mb-3"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        Free. No catch.
      </p>
      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="your@email.com"
          disabled={status === "loading" || status === "success"}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors text-sm"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {status === "error" && errorMessage && (
          <p
            className="text-xs text-red-400"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            {errorMessage}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={
            !isValidEmail(email) || status === "loading" || status === "success"
          }
          className={`px-4 py-3 w-full text-sm font-medium transition-all ${
            status === "success"
              ? "bg-green-900 text-green-300 cursor-default"
              : status === "error"
              ? "bg-red-900 text-red-300"
              : !isValidEmail(email) || status === "loading"
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              : "bg-tiepolo-pink-700 text-zinc-950 hover:bg-tiepolo-pink-600"
          }`}
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          {status === "loading"
            ? "Subscribing..."
            : status === "success"
            ? "You're in."
            : status === "error"
            ? "Try again"
            : "Subscribe"}
        </button>
      </div>
    </div>
  )
}

const photos = ["/joedeluca0.jpg", "/joedeluca1.jpg"]

// Function to get a random photo
const getRandomPhoto = () => {
  return photos[Math.floor(Math.random() * photos.length)]
}

export default function Sidebar() {
  // Use lazy initialization to pick photo once on mount
  const [currentPhoto] = useState(getRandomPhoto)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle"
  )
  const [errorMessage, setErrorMessage] = useState("")

  const MAX_CHARS = 10000 // Ridiculously high but safe
  const wordCount = message
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
  const charCount = message.length

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
        <div className="my-6">
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
          Leo Bruno is a writer living in Sardegna. Former ad agency art slag —
          art director, tech guy, occasional copywriter — at places like TM,
          VMLY&R, and Bernstein-Rein. Published in Gradiva and I-70 Review.
          Currently working on a book about Dirty Tiepolos and medieval saints.
        </p>

        <p className="text-zinc-400 text-base leading-relaxed mb-4">
          You can contact Leo below. If you want a response, be sure to include
          your name and email.
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

        <div className="border-t border-zinc-800 pt-6 mt-6">
          <h3
            className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Leo Reads Poems He Hates
          </h3>
          <Link
            href="/poems/the-red-wheelbarrow"
            className="text-zinc-300 hover:text-zinc-100 transition-colors text-base"
          >
            The Red Wheelbarrow
          </Link>
        </div>

        <div className="border-t border-zinc-800 pt-6 mt-6">
          <h3
            className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            <Link
              href="/work"
              className="hover:text-zinc-300 transition-colors"
            >
              Poems
            </Link>
          </h3>
          <Link
            href="/poems/ode-to-the-girl-on-the-bus"
            className="block text-zinc-300 hover:text-zinc-100 transition-colors text-base"
          >
            Ode to the Girl on the Bus
          </Link>
          <Link
            href="/poems/sokushinbutsu"
            className="block text-zinc-300 hover:text-zinc-100 transition-colors text-base mt-2"
          >
            Sokushinbutsu
          </Link>
        </div>

        <div className="border-t border-zinc-800 pt-6 mt-6">
          <h3
            className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            <Link
              href="/work"
              className="hover:text-zinc-300 transition-colors"
            >
              Short Fiction
            </Link>
          </h3>
          <Link
            href="/little-black-submarine"
            className="block text-zinc-300 hover:text-zinc-100 transition-colors text-base"
          >
            Little Black Submarine
          </Link>
        </div>

        <NewsletterSignup />
      </div>
    </aside>
  )
}
