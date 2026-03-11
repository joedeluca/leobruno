"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface CategoryLandingProps {
  label: string
  items: { href: string; title: string }[]
}

export default function CategoryLanding({ label, items }: CategoryLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const label = containerRef.current.querySelector(".fade-label")
    const titles = containerRef.current.querySelectorAll(".fade-title")

    // Label: simple fade
    gsap.fromTo(
      label,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power3.out" }
    )

    // Titles: slide up from below, staggered, after label
    gsap.fromTo(
      titles,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.2,
      }
    )
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center px-8 pb-48 pt-24 text-center"
    >
      <p
        className="fade-label"
        style={{
          fontFamily: '"Graphik", system-ui, sans-serif',
          fontSize: '17px',
          letterSpacing: '0.15em',
          color: '#5a4a3a',
          textTransform: 'uppercase',
          marginBottom: '3rem',
          opacity: 0,
        }}
      >
        {label}
      </p>
      {items.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          className="fade-title"
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            fontSize: 'clamp(1.9rem, 7vw, 5rem)',
            color: '#E8DCC8',
            lineHeight: 1.1,
            display: 'block',
            marginBottom: i < items.length - 1 ? '2.5rem' : 0,
            opacity: 0,
          }}
        >
          {item.title}
        </Link>
      ))}
    </div>
  )
}
