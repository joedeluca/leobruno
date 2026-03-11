"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import type { Post } from "@/lib/posts"

export default function HomeClient({ initialPosts }: { initialPosts: Post[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const titles = containerRef.current.querySelectorAll(".fade-title")
    gsap.fromTo(
      titles,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.1,
      }
    )
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-8 pb-48 pt-16 text-center"
    >
      {initialPosts.map((post, i) => (
        <Link
          key={post.slug}
          href={`/${post.slug}`}
          className="fade-title"
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            color: '#E8DCC8',
            lineHeight: 1.1,
            display: 'block',
            marginBottom: i < initialPosts.length - 1 ? '2.5rem' : 0,
            opacity: 0,
          }}
        >
          {post.title}
        </Link>
      ))}
    </div>
  )
}

