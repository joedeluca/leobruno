"use client"

import Link from "next/link"

export default function FictionIndex() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pb-48 pt-16 text-center">
      <p style={{
        fontFamily: '"Graphik", system-ui, sans-serif',
        fontSize: '17px',
        letterSpacing: '0.15em',
        color: '#5a4a3a',
        textTransform: 'uppercase',
        marginBottom: '3rem',
      }}>
        Reliquary, 2026
      </p>
      <Link
        href="/little-black-submarine"
        style={{
          fontFamily: '"Schnyder S", Georgia, serif',
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          color: '#E8DCC8',
          lineHeight: 1.1,
          display: 'block',
          marginBottom: '2.5rem',
        }}
      >
        Little Black Submarine
      </Link>
      <Link
        href="/easy-tommy-lee"
        style={{
          fontFamily: '"Schnyder S", Georgia, serif',
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          color: '#E8DCC8',
          lineHeight: 1.1,
          display: 'block',
        }}
      >
        Easy. Tommy Lee.
      </Link>
    </div>
  )
}
