import type { Metadata } from "next"
import Link from "next/link"
import { getAllCopywriterProjects } from "@/lib/copywriter"

export const metadata: Metadata = {
  title: "Copywriting",
  description: "Copywriting samples by Joe DeLuca — agency relaunches, B2B thought leadership, enterprise website copy, and product naming.",
}

export default function CopywriterPage() {
  const projects = getAllCopywriterProjects()

  return (
    <div className="min-h-screen flex flex-col items-center px-8 pb-48 pt-24 text-center">
      <div
        className="mb-16"
        style={{
          fontFamily: '"Graphik", system-ui, sans-serif',
          fontSize: '17px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: '#5a4a3a',
        }}
      >
        Copywriting
      </div>

      <div>
        {projects.map((project, i) => (
          <Link
            key={project.slug}
            href={`/copywriter/${project.slug}`}
            style={{
              fontFamily: '"Schnyder S", Georgia, serif',
              fontSize: 'clamp(1.9rem, 7vw, 5rem)',
              color: '#EDD9B8',
              lineHeight: 1.1,
              display: 'block',
              marginBottom: i < projects.length - 1 ? '2.5rem' : 0,
              transition: 'color 0.22s ease',
            }}
            className="hover:text-amber-400"
          >
            {project.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
