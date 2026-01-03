"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import type { MarkdownContent } from "@/lib/markdown"

interface ContentGridProps {
  content: MarkdownContent[]
}

export default function ContentGrid({ content }: ContentGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  // GSAP animation on mount
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".content-card")

      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        }
      )
    }
  }, [content])

  return (
    <div>
      <h2>All Content</h2>

      <div ref={gridRef}>
        {content.map((item) => (
          <Link key={item.slug} href={`/${item.slug}`} className="content-card">
            <div>
              <span>{item.category}</span>
              <span>{item.date}</span>
            </div>

            <h3>{item.title}</h3>

            <p>{item.excerpt}</p>

            {item.tags.length > 0 && (
              <div>
                {item.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
