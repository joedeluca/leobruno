"use client"

import { useRef, useEffect } from "react"
import PostList from "@/components/PostList"
import Sidebar from "@/components/Sidebar"
import { gsap } from "gsap"
import type { Post } from "@/lib/posts"

export default function HomeClient({ initialPosts }: { initialPosts: Post[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  // Fade in on mount
  useEffect(() => {
    if (!hasAnimated.current && containerRef.current) {
      hasAnimated.current = true
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      )
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full opacity-0">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Article column */}
        <div className="lg:w-3/4 w-full lg:border-r lg:border-[#3A2E24]">
          <div className="px-12 pb-12 pt-12 lg:pr-12">
            <PostList posts={initialPosts} searchQuery="" />
          </div>
        </div>

        {/* Sidebar column */}
        <div className="lg:w-1/4 w-full px-10 pb-12 pt-12 lg:pl-10 mt-8 lg:mt-0">
          <Sidebar />
        </div>
      </div>
    </div>
  )
}

