"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const photos = ["/joedeluca0.jpg", "/joedeluca1.jpg"]

// Function to get a random photo
const getRandomPhoto = () => {
  return photos[Math.floor(Math.random() * photos.length)]
}

export default function Sidebar() {
  // Use lazy initialization to pick photo once on mount
  const [currentPhoto] = useState(getRandomPhoto)

  return (
    <aside className="space-y-8">
      <div>
        <div className="mb-6">
          <Image
            src={currentPhoto}
            alt="Leo Bruno"
            width={400}
            height={400}
            className="w-full h-auto aspect-square object-cover"
            priority
          />
        </div>

        <p className="text-zinc-400 text-base leading-relaxed mb-8">
          <h3
            className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Welcome
          </h3>
          I do a lot of reading writing in dark rooms illuminated by candles
          stuck in the tops of skulls. You can also imagine a lot of ink wells,
          and ravens feathers.
        </p>

        <div className="border-t border-zinc-800 pt-6">
          <h3
            className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Leo Reads
          </h3>
          <Link
            href="/poems/the-red-wheelbarrow"
            className="text-zinc-300 hover:text-zinc-100 transition-colors text-base"
          >
            The Red Wheelbarrow
          </Link>
        </div>
      </div>
    </aside>
  )
}
