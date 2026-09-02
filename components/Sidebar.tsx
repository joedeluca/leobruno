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

      // Redirect to /account — server already created the session token
      if (data.redirect) {
        window.location.href = data.redirect
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error("Subscribe catch:", msg)
      setErrorMessage(msg || "Network error — please try again.")
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
    <div className="border-t pt-10 mt-10" style={{ borderColor: '#3A2E24' }}>
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
              className="w-full px-4 py-3 bg-zinc-900 border text-sm focus:outline-none transition-colors"
              style={{
                fontFamily: '"Graphik", system-ui, sans-serif',
                borderColor: 'rgba(92,132,114,0.35)',
                color: '#DEDAD4',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#5C8472'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(92,132,114,0.35)'}
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
              className="px-4 py-3 w-full text-sm font-medium transition-all"
              style={{
                fontFamily: '"Graphik", system-ui, sans-serif',
                backgroundColor:
                  status === "success" ? '#1a3a1e'
                  : status === "error" ? '#3a1a1a'
                  : !isValidEmail(email) || status === "loading" ? '#1A2E26'
                  : '#5C8472',
                color:
                  status === "success" ? '#86efac'
                  : status === "error" ? '#fca5a5'
                  : !isValidEmail(email) || status === "loading" ? '#3D5A52'
                  : '#0C0A08',
                cursor: (!isValidEmail(email) || status === "loading" || status === "success") ? 'not-allowed' : 'pointer',
              }}
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
  const [contactOpen, setContactOpen] = useState(false)
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
        <div className="text-base leading-relaxed mb-4">
          <h3
            className="text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#EDEAE4' }}
          >
            Welcome
          </h3>
          <div>
            <Image
              src={currentPhoto}
              alt="Leo Bruno"
              width={160}
              height={160}
              className="float-right ml-4 mb-2 w-24 h-24 lg:w-36 lg:h-36 object-cover aspect-square"
              priority
            />
            <p className="text-base leading-relaxed" style={{ color: '#A8A5A0' }}>
            Leo Bruno is a writer living on a remote, sheep infested island. Former ad agency art slag —
            copywriter, art director — at places like VML & Y&R. Once upon a time a student of the poet David Ray, published in his journal Newletters and elsewhere. Currently
            working on a book about dirty Tiepolos and medieval relics.
            </p>
            <div className="clear-both" />
          </div>
        </div>

        <button
          onClick={() => setContactOpen(o => !o)}
          className="flex items-center gap-2 text-sm mb-4 transition-colors"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#A8A5A0', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          Contact Leo
          <span style={{ fontSize: '0.6rem', color: '#7A7872' }}>{contactOpen ? '▲' : '▼'}</span>
        </button>

        {contactOpen && (
          <>
            <p className="text-base leading-relaxed mb-4" style={{ color: '#A8A5A0' }}>
              If you want a response, be sure to include your name and email.
            </p>

            <div className="space-y-3 mb-4">
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
                  className="w-full h-32 px-4 py-3 bg-zinc-900 border resize-none focus:outline-none transition-colors"
                  style={{
                    fontFamily: '"Graphik", system-ui, sans-serif',
                    borderColor: 'rgba(92,132,114,0.35)',
                    color: '#DEDAD4',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#5C8472'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(92,132,114,0.35)'}
                  maxLength={MAX_CHARS}
                  spellCheck={false}
                  disabled={isSending}
                />
                {isSending && (
                  <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#5C8472', borderTopColor: 'transparent' }}></div>
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
                  className="px-4 py-3 w-full text-sm font-medium transition-all"
                  style={{
                    fontFamily: '"Graphik", system-ui, sans-serif',
                    backgroundColor:
                      wordCount < 3 || isSending ? '#1A2E26'
                      : sendStatus === "success" ? '#1a3a1e'
                      : sendStatus === "error" ? '#3a1a1a'
                      : '#5C8472',
                    color:
                      wordCount < 3 || isSending ? '#3D5A52'
                      : sendStatus === "success" ? '#86efac'
                      : sendStatus === "error" ? '#fca5a5'
                      : '#0C0A08',
                    cursor: (wordCount < 3 || isSending) ? 'not-allowed' : 'pointer',
                  }}
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
          </>
        )}

        <div className="border-t pt-10 mt-10" style={{ borderColor: '#3A2E24' }}>
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
            href="/poems/sokushinbutsu"
            className="block transition-colors text-base"
            style={{ color: '#A8A5A0' }}
          >
            Sokushinbutsu
          </Link>
        </div>

        <div className="border-t pt-10 mt-10" style={{ borderColor: '#3A2E24' }}>
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
          <Link
            href="/easy-tommy-lee"
            className="block transition-colors text-base"
            style={{ color: '#A8A5A0' }}
          >
            Easy Tommy Lee
          </Link>
        </div>

        <NewsletterSignup />
      </div>
    </aside>
  )
}
