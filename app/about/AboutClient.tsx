"use client"

import { useState } from "react"
import Image from "next/image"

const photos = ["/joedeluca0.jpg", "/joedeluca1.jpg"]

export default function AboutClient() {
  const [photo] = useState(() => photos[Math.floor(Math.random() * photos.length)])

  return (
    <div className="px-8 py-16">
      <div className="max-w-lg w-full">
        <Image
          src={photo}
          alt="Leo Bruno"
          width={256}
          height={256}
          className="w-48 h-48 lg:w-64 lg:h-64 object-cover aspect-square mb-10"
          priority
        />
        <h1
          className="mb-8 leading-none"
          style={{
            fontFamily: '"Schnyder S", serif',
            fontWeight: 700,
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            color: '#E8DCC8',
          }}
        >
          Leo Bruno
        </h1>
        <p
          className="leading-relaxed"
          style={{
            fontFamily: '"Graphik", sans-serif',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#A8A5A0',
          }}
        >
          Leo Bruno is a writer living on a remote, sheep infested island. Former ad agency art slag —
          copywriter, art director — at places like VML & Y&R. Once upon a time a student of the poet David Ray,
          published in his journal <em>Newletters</em> and elsewhere. Currently working on a book about dirty
          Tiepolos and medieval relics.
        </p>
      </div>
    </div>
  )
}
