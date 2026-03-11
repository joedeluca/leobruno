"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

export interface HomeItem {
  slug: string
  title: string
  date: string
  category: string
  href: string
}

const FILTERS = ["Essays", "Fiction", "Poetry"] as const
type Filter = typeof FILTERS[number]

function matchesFilter(item: HomeItem, filter: Filter): boolean {
  switch (filter) {
    case "Fiction":  return item.category === "Fiction"
    case "Poetry":   return item.category === "Poetry" || item.category === "Poem"
    case "Essays":   return item.category !== "Fiction" && item.category !== "Poetry" && item.category !== "Poem"
  }
}

export default function HomeClient({ initialItems }: { initialItems: HomeItem[] }) {
  const [activeFilters, setActiveFilters] = useState<Set<Filter>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Initial fade in
  useEffect(() => {
    const els = itemRefs.current.filter(Boolean)
    gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out", delay: 0.1 })
  }, [])

  const handleFilter = (f: Filter) => {
    const next = new Set(activeFilters)
    if (next.has(f)) next.delete(f) else next.add(f)
    setActiveFilters(next)

    initialItems.forEach((item, i) => {
      const el = itemRefs.current[i]
      if (!el) return
      const visible = next.size === 0 || [...next].some(filter => matchesFilter(item, filter))

      if (visible) {
        gsap.to(el, {
          maxHeight: 300,
          marginBottom: '2.5rem',
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => gsap.to(el, { opacity: 1, duration: 0.35, ease: "power2.out" })
        })
      } else {
        gsap.to(el, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => gsap.to(el, { maxHeight: 0, marginBottom: 0, duration: 0.3, ease: "power2.inOut" })
        })
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-8 pb-48 pt-24 text-center">
      {/* Filter row */}
      <div className="flex gap-8 mb-16">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            style={{
              fontFamily: '"Graphik", system-ui, sans-serif',
              fontSize: '17px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: activeFilters.has(f) ? '#EDD9B8' : '#5a4a3a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.25s ease',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* All items always in DOM — gaps close physically as items collapse */}
      <div>
        {initialItems.map((item, i) => (
          <div
            key={item.slug}
            ref={el => { itemRefs.current[i] = el }}
            style={{ maxHeight: '300px', overflow: 'hidden', marginBottom: '2.5rem' }}
          >
            <Link
              href={item.href}
              style={{
                fontFamily: '"Schnyder S", Georgia, serif',
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                color: '#EDD9B8',
                lineHeight: 1.1,
                display: 'block',
              }}
            >
              {item.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

