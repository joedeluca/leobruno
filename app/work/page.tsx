"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import InlineAudioPlayer from "@/components/InlineAudioPlayer"

interface Poem {
  slug: string
  title: string
  author: string
  date: string
  collection?: string
}

interface Post {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  teaser?: string
}

function generateAudioUrl(title: string, author: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const authorSlug = author
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `/audio/poems/${titleSlug}-by-${authorSlug}.m4a`
}

const FICTION_CATEGORIES = ["Leo Bruno Fiction", "Fiction"]

export default function WorkPage() {
  const [leoBrunoPoems, setLeoBrunoPoems] = useState<Poem[]>([])
  const [otherPoems, setOtherPoems] = useState<Poem[]>([])
  const [fiction, setFiction] = useState<Post[]>([])
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Fetch poems
    fetch("/api/poems")
      .then((res) => res.json())
      .then((data) => {
        const leo = (data.poems as Poem[]).filter(
          (p) => p.author === "Leo Bruno"
        )
        const others = (data.poems as Poem[]).filter(
          (p) => p.author !== "Leo Bruno"
        )
        setLeoBrunoPoems(leo)
        setOtherPoems(others)
      })

    // Fetch fiction posts
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        const fictionPosts = (data.posts as Post[]).filter((p) =>
          FICTION_CATEGORIES.includes(p.category)
        )
        setFiction(fictionPosts)
      })
  }, [])

  const ready =
    leoBrunoPoems.length > 0 || otherPoems.length > 0 || fiction.length > 0

  useEffect(() => {
    if (ready && !hasAnimated) {
      setHasAnimated(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          gsap.fromTo(
            ".work-section",
            { opacity: 0 },
            { opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" }
          )
        })
      })
    }
  }, [ready, hasAnimated])

  return (
    <div className="w-full h-full">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Main Content */}
        <div className="lg:w-3/4 w-full px-8 pb-12 pt-[2rem]">
          <h1
            className="text-zinc-50 font-bold mb-4"
            style={{
              fontFamily: '"Schnyder S", Georgia, serif',
              fontSize: "30px",
              lineHeight: 1,
            }}
          >
            Work
          </h1>
          <p className="text-lg text-zinc-400 mb-12">
            Original poems and short fiction by Leo Bruno, alongside poems
            referenced in his essays. All Leo Bruno work is copyrighted.
            Referenced poems are public domain.
          </p>

          {/* ── Poems: Leo Bruno ── */}
          {leoBrunoPoems.length > 0 && (
            <div className="work-section mb-12" style={{ opacity: 0 }}>
              <h2
                className="font-bold text-zinc-100 mb-4 border-b border-zinc-800 pb-2"
                style={{
                  fontFamily: '"Schnyder S", Georgia, serif',
                  fontSize: "22px",
                }}
              >
                Poems
              </h2>
              <div className="mb-6">
                <h3
                  className="text-zinc-300 font-semibold mb-3"
                  style={{
                    fontFamily: '"Schnyder S", Georgia, serif',
                    fontSize: "18px",
                  }}
                >
                  Leo Bruno
                </h3>
                <ul className="space-y-2 list-none pl-4">
                  {leoBrunoPoems.map((poem) => (
                    <li key={poem.slug}>
                      <Link
                        href={`/poems/${poem.slug}`}
                        className="text-zinc-400 hover:text-zinc-100 transition-colors"
                        style={{
                          fontFamily: '"Graphik", system-ui, sans-serif',
                        }}
                      >
                        {poem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Other poets grouped by author */}
              {Object.entries(
                otherPoems.reduce<Record<string, Poem[]>>((acc, poem) => {
                  if (!acc[poem.author]) acc[poem.author] = []
                  acc[poem.author].push(poem)
                  return acc
                }, {})
              ).map(([author, poems]) => (
                <div key={author} className="mb-6">
                  <h3
                    className="text-zinc-300 font-semibold mb-3"
                    style={{
                      fontFamily: '"Schnyder S", Georgia, serif',
                      fontSize: "18px",
                    }}
                  >
                    {author}
                  </h3>
                  <ul className="space-y-2 list-none pl-4">
                    {poems.map((poem) => (
                      <li key={poem.slug}>
                        <Link
                          href={`/poems/${poem.slug}`}
                          className="text-zinc-400 hover:text-zinc-100 transition-colors"
                          style={{
                            fontFamily: '"Graphik", system-ui, sans-serif',
                          }}
                        >
                          {poem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* ── Short Fiction ── */}
          {fiction.length > 0 && (
            <div className="work-section" style={{ opacity: 0 }}>
              <h2
                className="font-bold text-zinc-100 mb-4 border-b border-zinc-800 pb-2"
                style={{
                  fontFamily: '"Schnyder S", Georgia, serif',
                  fontSize: "22px",
                }}
              >
                Short Fiction
              </h2>
              <div className="mb-6">
                <h3
                  className="text-zinc-300 font-semibold mb-3"
                  style={{
                    fontFamily: '"Schnyder S", Georgia, serif',
                    fontSize: "18px",
                  }}
                >
                  Leo Bruno
                </h3>
                <ul className="space-y-3 list-none pl-4">
                  {fiction.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/${post.slug}`}
                        className="text-zinc-400 hover:text-zinc-100 transition-colors"
                        style={{
                          fontFamily: '"Graphik", system-ui, sans-serif',
                        }}
                      >
                        <div className="font-medium">{post.title}</div>
                        {post.teaser && (
                          <div className="text-sm text-zinc-600 mt-0.5">
                            {post.teaser}
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4 w-full lg:border-l lg:border-[#3A2E24] px-8 pb-12">
          <div className="lg:sticky lg:top-[7rem]">
            <h3
              className="text-xs uppercase tracking-wider text-zinc-500 mb-4"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              Leo Bruno Poems
            </h3>
            <ul className="space-y-3 list-none pl-0 mb-8">
              {leoBrunoPoems.map((poem) => {
                const audioUrl = generateAudioUrl(poem.title, poem.author)
                return (
                  <li key={poem.slug}>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/poems/${poem.slug}`}
                        className="text-zinc-400 hover:text-zinc-100 transition-colors text-base block flex-1"
                      >
                        {poem.title}
                      </Link>
                      <div className="pt-0.5">
                        <InlineAudioPlayer
                          audioUrl={audioUrl}
                          title={poem.title}
                          author={poem.author}
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            {fiction.length > 0 && (
              <>
                <h3
                  className="text-xs uppercase tracking-wider text-zinc-500 mb-4"
                  style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                >
                  Short Fiction
                </h3>
                <ul className="space-y-3 list-none pl-0">
                  {fiction.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/${post.slug}`}
                        className="text-zinc-400 hover:text-zinc-100 transition-colors text-base block"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
