"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState("")
  // null = unknown (hydrating), false = logged out, string = email of logged-in user
  const [loggedInEmail, setLoggedInEmail] = useState<string | null | false>(
    null
  )

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    // Get current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedInEmail(session?.user?.email ?? false)
    })
    // Keep in sync if they sign out elsewhere
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedInEmail(session?.user?.email ?? false)
    })
    return () => subscription.unsubscribe()
  }, [])

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

      // Track signup event
      if (typeof window !== "undefined" && (window as any).va) {
        ;(window as any).va.track("newsletter_signup", {
          source: document.referrer,
        })
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
    <div className="border-t pt-6 mt-6" style={{ borderColor: '#3A2E24' }}>
      <h3
        className="text-xs uppercase tracking-wider mb-3"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#EDEAE4' }}
      >
        Newsletter
      </h3>

      {/* Logged-in state */}
      {loggedInEmail ? (
        <div className="space-y-2">
          <p
            className="text-sm"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#A8A5A0' }}
          >
            {loggedInEmail}
          </p>
          <Link
            href="/account"
            className="block text-sm transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#A8A5A0' }}
          >
            Your account →
          </Link>
        </div>
      ) : (
        /* Logged-out / unknown state — show form */
        <>
          <p
            className="text-sm leading-relaxed mb-3 flex items-baseline gap-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#A8A5A0' }}
          >
            <span>Free. No catch.</span>
            <Link href="/newsletter" className="transition-colors underline underline-offset-2 text-xs" style={{ color: '#A8A5A0' }}>
              Why subscribe?
            </Link>
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
                !isValidEmail(email) ||
                status === "loading" ||
                status === "success"
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
                ? "Signing in…"
                : status === "success"
                ? "You're in."
                : status === "error"
                ? "Try again"
                : "Subscribe / Sign in"}
            </button>
          </div>
        </>
      )}
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
        <div className="mt-6 mb-10 -mx-4 w-[calc(100%+2rem)]">
          <Image
            src={currentPhoto}
            alt="Leo Bruno"
            width={400}
            height={400}
            className="w-full h-auto aspect-square object-cover"
            priority
          />
        </div>

        <div className="text-base leading-relaxed mb-4">
          <h3
            className="text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#EDEAE4' }}
          >
            Welcome
          </h3>
          <p className="text-base leading-relaxed" style={{ color: '#A8A5A0' }}>
          Leo Bruno is a writer living in Sardegna. Former ad agency art slag —
          copywriter, art director — at places like TM, VMLY&R, and
          Bernstein-Rein. Published in Gradiva and I-70 Review. Currently
          working on a book about dirty Tiepolos and medieval relics.
          </p>
        </div>

        <p className="text-base leading-relaxed mb-4" style={{ color: '#A8A5A0' }}>
          You can contact Leo below. If you want a response, be sure to include
          your name and email.
        </p>

        <div className="space-y-3">
          <span
            className="text-xs"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#7A7872' }}
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

        <div className="border-t pt-6 mt-6" style={{ borderColor: '#3A2E24' }}>
          <h3
            className="text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#EDEAE4' }}
          >
            Leo Reads Poems He Hates
          </h3>
          <Link
            href="/poems/the-red-wheelbarrow"
            className="transition-colors text-base"
            style={{ color: '#A8A5A0' }}
          >
            The Red Wheelbarrow
          </Link>
        </div>

        <div className="border-t pt-6 mt-6" style={{ borderColor: '#3A2E24' }}>
          <h3
            className="text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#EDEAE4' }}
          >
            <Link
              href="/work"
              className="transition-colors"
              style={{ color: '#EDEAE4' }}
            >
              Poems
            </Link>
          </h3>
          <Link
            href="/poems/ode-to-the-girl-on-the-bus"
            className="block transition-colors text-base"
            style={{ color: '#A8A5A0' }}
          >
            Ode to the Girl on the Bus
          </Link>
          <Link
            href="/poems/sokushinbutsu"
            className="block transition-colors text-base mt-2"
            style={{ color: '#A8A5A0' }}
          >
            Sokushinbutsu
          </Link>
        </div>

        <div className="border-t pt-6 mt-6" style={{ borderColor: '#3A2E24' }}>
          <h3
            className="text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#EDEAE4' }}
          >
            <Link
              href="/work"
              className="transition-colors"
              style={{ color: '#EDEAE4' }}
            >
              Short Fiction
            </Link>
          </h3>
          <Link
            href="/little-black-submarine"
            className="block transition-colors text-base"
            style={{ color: '#A8A5A0' }}
          >
            Little Black Submarine
          </Link>
        </div>

        <NewsletterSignup />
      </div>
    </aside>
  )
}
