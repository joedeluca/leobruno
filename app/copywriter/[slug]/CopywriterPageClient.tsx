"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import type { CopywriterProject } from "@/lib/copywriter"

export default function CopywriterPageClient({ project }: { project: CopywriterProject }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" })
  }, [])

  return (
    <div ref={containerRef} className="w-full min-h-screen" style={{ opacity: 0 }}>
      <div className="max-w-5xl mx-auto px-8 py-12">

        <header className="mb-12">
          <h5
            className="text-zinc-400 uppercase tracking-wide mb-3"
            style={{
              fontFamily: '"Graphik", system-ui, sans-serif',
              fontSize: 'clamp(0.875rem, 2vw, 1.5rem)',
            }}
          >
            {project.type} &nbsp;·&nbsp; {project.client}
          </h5>
          <h1
            className="text-zinc-100 font-bold leading-tight mb-4"
            style={{
              fontFamily: '"Schnyder S", Georgia, serif',
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: '1.2',
            }}
          >
            {project.title}
          </h1>
          {project.pdfs && project.pdfs.length > 0 && (
            <div className="flex flex-wrap gap-6 mt-6">
              {project.pdfs.map((pdf) => (
                <a
                  key={pdf.file}
                  href={pdf.file}
                  download
                  style={{
                    fontFamily: '"Graphik", system-ui, sans-serif',
                    fontSize: '17px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#5a4a3a',
                    textDecoration: 'none',
                    borderBottom: '1px solid #3A2E24',
                    paddingBottom: '2px',
                    transition: 'color 0.2s',
                  }}
                  className="hover:text-amber-400"
                >
                  {pdf.label} ↓
                </a>
              ))}
            </div>
          )}
        </header>

        <article
          className="prose prose-zinc prose-lg max-w-none"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
          dangerouslySetInnerHTML={{ __html: project.content || "" }}
        />

      </div>
    </div>
  )
}
