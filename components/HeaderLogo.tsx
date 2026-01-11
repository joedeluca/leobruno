"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { gsap } from "gsap"

export default function HeaderLogo() {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const linkRef = useRef<HTMLDivElement>(null)
  const previousPathRef = useRef(pathname)

  // Only show on individual poem pages, not the poems index
  const isPoemDetailPage = pathname?.match(/^\/poems\/[^/]+$/)

  useEffect(() => {
    if (!containerRef.current || !nameRef.current || !linkRef.current) return

    // Don't animate on initial load
    if (previousPathRef.current === pathname) return
    previousPathRef.current = pathname

    const tl = gsap.timeline()

    // Fade out entire container
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: "power2.in",
    })

    // While invisible, instantly change everything
    if (isPoemDetailPage) {
      tl.set(nameRef.current, {
        scale: 0.8,
        y: -1.5,
      })
      tl.set(linkRef.current, {
        display: "block",
      })
    } else {
      tl.set(nameRef.current, {
        scale: 1,
        y: 0,
      })
      tl.set(linkRef.current, {
        display: "none",
      })
    }

    // Fade container back in
    tl.to(containerRef.current, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    })
  }, [pathname, isPoemDetailPage])

  return (
    <div ref={containerRef} className="flex flex-col justify-center h-full">
      <Link href="/">
        <h1
          ref={nameRef}
          className="text-tiepolo-pink-600 hover:text-tiepolo-pink-700 transition-colors cursor-pointer"
          style={{
            margin: 0,
            lineHeight: 1,
            fontSize: "30px",
            transformOrigin: "left center",
          }}
        >
          Leo Bruno
        </h1>
      </Link>

      <div
        ref={linkRef}
        className="mt-1"
        style={{
          display: "none",
        }}
      >
        <Link
          href="/poems"
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          ← Poem Index
        </Link>
      </div>
    </div>
  )
}
