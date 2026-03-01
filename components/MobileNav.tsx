"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Essays" },
  { href: "/", label: "Field Guide" },
  { href: "/poems", label: "Poems" },
  { href: "/newsletter", label: "Newsletter" },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
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

      {/* Fullscreen overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ backgroundColor: '#09090b', backdropFilter: 'blur(12px)' }}
        >
          {/* Close button top-right */}
          <div className="flex justify-end px-8 pt-10">
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Close menu"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Close
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col items-center justify-center flex-1 gap-10">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="transition-colors hover:text-white"
                style={{
                  fontFamily: '"Schnyder S", Georgia, serif',
                  fontSize: 'clamp(2.5rem, 10vw, 4rem)',
                  color: '#E8DCC8',
                  opacity: 0.85,
                  lineHeight: 1,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bottom hint */}
          <p
            className="text-center pb-10"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', fontSize: '11px', color: '#3A3028', letterSpacing: '0.1em' }}
          >
            ⌘K to search
          </p>
        </div>
      )}
    </>
  )
}
