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
    const children = containerRef.current.querySelectorAll(".fade-item")
    gsap.fromTo(
      children,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
      }
    )
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-8 pb-48 pt-16 text-center"
    >
      <p
        className="fade-item"
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
          className="fade-item"
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
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
