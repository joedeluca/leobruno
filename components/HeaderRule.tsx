"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

// The header's bottom rule. Absent at the top of the page; drawn across,
// left to right, once the page scrolls, and drawn back when it returns.
export default function HeaderRule() {
  const ruleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rule = ruleRef.current
    if (!rule) return
    let drawn = false

    const update = (instant = false) => {
      const next = window.scrollY > 4
      if (next === drawn) return
      drawn = next
      gsap.to(rule, {
        scaleX: next ? 1 : 0,
        duration: instant ? 0 : next ? 0.7 : 0.4,
        ease: next ? "power3.out" : "power2.in",
        overwrite: true,
      })
    }

    update(true)
    const onScroll = () => update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      ref={ruleRef}
      aria-hidden="true"
      className="absolute left-0 right-0 bottom-0 h-px pointer-events-none"
      style={{ background: "#3A2E24", transform: "scaleX(0)", transformOrigin: "left center" }}
    />
  )
}
