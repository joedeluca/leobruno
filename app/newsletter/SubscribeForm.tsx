"use client"

import { useState } from "react"

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

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
      if (data.redirect) window.location.href = data.redirect
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error("Subscribe catch:", msg)
      setErrorMessage(msg || "Network error — please try again.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <p
        className="text-zinc-400 leading-relaxed"
        style={{
          fontFamily: '"Graphik", system-ui, sans-serif',
          fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
        }}
      >
        You're in. Or rather — you're in the black hole. Welcome. Expect nothing
        on a schedule, and something when it matters.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="nl-email"
        className="block text-xs uppercase tracking-widest text-zinc-500"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        Your address, into the void
      </label>
      <div className="flex border border-zinc-700 focus-within:border-zinc-400 transition-colors">
        <input
          id="nl-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === "error") { setStatus("idle"); setErrorMessage("") }
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="you@somewhere.com"
          autoComplete="email"
          disabled={status === "loading"}
          className="flex-1 min-w-0 bg-zinc-900/50 px-5 py-4 text-zinc-300 placeholder-zinc-600 focus:outline-none"
          style={{
            fontFamily: '"Graphik", system-ui, sans-serif',
            fontSize: "1.05rem",
          }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValidEmail(email) || status === "loading"}
          className="px-6 py-4 bg-zinc-100 text-zinc-950 text-xs uppercase tracking-widest hover:bg-tiepolo-pink-600 hover:text-white transition-colors disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed flex-shrink-0"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          {status === "loading" ? "..." : "Enter"}
        </button>
      </div>
      {status === "error" && errorMessage && (
        <p className="text-xs text-red-400" style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
          {errorMessage}
        </p>
      )}
      <p
        className="text-zinc-600 text-xs leading-relaxed"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        No tracking. No data sold. Unsubscribe by replying "out."
      </p>
    </div>
  )
}
