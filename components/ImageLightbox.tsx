"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

interface LightboxState {
  src: string
  alt: string
}

export default function ImageLightbox() {
  const [image, setImage] = useState<LightboxState | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const { src, alt } = (e as CustomEvent<LightboxState>).detail
      setImage({ src, alt })
    }
    window.addEventListener("openLightbox", handleOpen)
    return () => window.removeEventListener("openLightbox", handleOpen)
  }, [])

  useEffect(() => {
    if (image && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out" })
    }
  }, [image])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImage(null)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  if (!image) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: "rgba(9,9,11,0.92)", backdropFilter: "blur(12px)" }}
      onClick={() => setImage(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "88vh",
          objectFit: "contain",
          boxShadow: "0 8px 48px rgba(0,0,0,0.7)",
          borderRadius: "2px",
        }}
      />
    </div>
  )
}
