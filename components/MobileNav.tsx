"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"

const links = [
  { href: "/", label: "Essays" },
  { href: "/", label: "Field Guide" },
  { href: "/poems", label: "Poems" },
  { href: "/newsletter", label: "Newsletter" },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // GSAP animate in/out
  useEffect(() => {
    if (!panelRef.current) return
    if (open) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
      )
    } else {
      gsap.to(panelRef.current, { opacity: 0, y: 16, duration: 0.2, ease: "power2.in" })
    }
  }, [open])

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col justify-center items-center gap-[5px] w-8 h-8 flex-shrink-0"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span
          className="block h-px w-5 transition-all duration-300 origin-center"
          style={{
            background: '#E8DCC8',
            opacity: 0.7,
            transform: open ? 'translateY(6px) rotate(45deg)' : 'none',
          }}
        />
        <span
          className="block h-px w-5 transition-all duration-300"
          style={{
            background: '#E8DCC8',
            opacity: open ? 0 : 0.7,
          }}
        />
        <span
          className="block h-px w-5 transition-all duration-300 origin-center"
          style={{
            background: '#E8DCC8',
            opacity: 0.7,
            transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none',
          }}
        />
      </button>

      {/* Dropdown panel — below header, full width */}
      <div
        ref={panelRef}
        className="fixed left-0 right-0 z-[100]"
        style={{
          top: '7rem', // h-28
          backgroundColor: '#09090b',
          borderBottom: '1px solid #3A2E24',
          pointerEvents: open ? 'auto' : 'none',
          opacity: 0,
        }}
      >
        <nav className="flex flex-col px-8 py-10 gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: '"Schnyder S", Georgia, serif',
                fontSize: 'clamp(2rem, 9vw, 3rem)',
                color: '#E8DCC8',
                opacity: 0.85,
                lineHeight: 1,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p
          className="px-8 pb-8"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif', fontSize: '11px', color: '#5a4a3a', letterSpacing: '0.1em' }}
        >
          ⌘K to search
        </p>
      </div>
    </>
  )
}
