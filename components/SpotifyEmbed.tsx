"use client"

import { useRef } from "react"

interface SpotifyEmbedProps {
  src: string
  height?: number
}

export default function SpotifyEmbed({ src, height = 152 }: SpotifyEmbedProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleLoad = () => {
    if (overlayRef.current) {
      overlayRef.current.style.opacity = "0"
      overlayRef.current.style.pointerEvents = "none"
    }
  }

  return (
    <div className="spotify-embed">
      <div style={{ position: "relative", height }}>
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            backgroundColor: "#121212",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.3s ease",
            zIndex: 1,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ opacity: 0.3 }}
          >
            <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.5" />
            <polygon points="10,8 16,12 10,16" fill="#fff" />
          </svg>
        </div>
        <iframe
          src={src}
          width="100%"
          height={height}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          onLoad={handleLoad}
          style={{ borderRadius: 12, display: "block" }}
        />
      </div>
    </div>
  )
}
