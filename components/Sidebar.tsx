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
  const [showAbout, setShowAbout] = useState(false)

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

        <p className="text-zinc-400 text-base leading-relaxed mb-4">
          <h3
            className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Welcome
          </h3>
          I do a lot of reading and writing in dark rooms illuminated by candles
          stuck in the tops of skulls. Add to that a lot of ink wells, ravens
          feathers, and about a million dark and stormy nights. Add all that up
          and you've got one thing -- the dramaturgical musings of me -- Leo
          Bruno.
        </p>

        {/* <div className="mb-8">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm underline underline-offset-2"
          >
            {showAbout ? "Close" : "More"}
          </button>

          {showAbout && (
            <p className="text-zinc-400 text-base leading-relaxed mt-4">
              I like to create characters and tell their story. All you want to
              know about me is in them. I suggest my novel Reliquary.
            </p>
          )}
        </div> */}

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
