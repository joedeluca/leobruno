# Recipe: Leo Bruno Blog — ⌘K Search

A complete recipe for Claude Code to replicate this blog setup, with emphasis on the Command+K full-text search overlay.

---

## Stack

- **Next.js 16** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS v3** with a warm zinc palette override
- **GSAP** for animations
- **gray-matter** for markdown frontmatter parsing
- **Supabase** for auth (newsletter / gated content)
- **Vercel** for deployment

---

## Directory Structure

```
/
├── app/
│   ├── layout.tsx          # Root layout — mounts SearchOverlay globally
│   ├── page.tsx            # Home — reads all posts server-side, passes to HomeClient
│   ├── HomeClient.tsx      # Client: post list + filter buttons + ⌘K shortcut
│   ├── globals.css         # Tailwind + warm palette overrides + custom fonts
│   └── api/
│       └── posts/
│           └── route.ts    # GET /api/posts → returns all content as JSON
├── components/
│   ├── SearchOverlay.tsx   # ⌘K overlay — THE MAIN SEARCH COMPONENT
│   ├── HeaderLogo.tsx      # Logo image link
│   ├── Footer.tsx
│   └── MobileNav.tsx
├── lib/
│   ├── markdown.ts         # getAllContent() — reads every .md file recursively
│   ├── posts.ts            # getSortedPostsData() — posts-only reader
│   └── formatDate.ts       # Intl date formatter
└── posts/                  # Markdown blog posts (flat directory)
    └── *.md
```

---

## 1. Markdown Post Format

Every file in `/posts/` is a `.md` with this frontmatter:

```markdown
---
title: "Post Title"
titleShort: "Short Title"          # optional, for tight UI spaces
date: "2026-03-18"
category: "Essays"                 # Essays | Fiction | Poetry | Marginalia
tags: ["Italy", "Field Notes"]
excerpt: "One sentence shown in search results."
teaser: "Alternate short pull-quote shown on home page."
teaserShort: "Even shorter version."
heroImage: "/images/hero.jpg"      # optional
heroImageSize: "cover"             # cover | contain | auto
heroImagePosition: "center"
heroImageHeight: "96vh"
---

Body content in plain markdown...
```

---

## 2. Content Reader — `lib/markdown.ts`

Reads **all** `.md` files recursively from `/posts/`, parses frontmatter, and returns the raw markdown body (not rendered HTML). The raw body is what the search indexes.

```typescript
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const postsDirectory = path.join(process.cwd(), "posts")

export interface MarkdownContent {
  slug: string
  title: string
  titleShort?: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  teaser?: string
  teaserShort?: string
  content: string   // raw markdown — indexed for search
  path: string
}

function getAllMarkdownFiles(dir = postsDirectory): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).flatMap((item) => {
    const full = path.join(dir, item)
    return fs.statSync(full).isDirectory()
      ? getAllMarkdownFiles(full)
      : full.endsWith(".md") ? [full] : []
  })
}

function getMarkdownContent(filePath: string): MarkdownContent {
  const { data, content } = matter(fs.readFileSync(filePath, "utf8"))
  const slug = path.relative(postsDirectory, filePath).replace(/\.md$/, "").replace(/\\/g, "/")
  return {
    slug,
    title: data.title || "",
    titleShort: data.titleShort || data.title || "",
    date: data.date || "",
    category: data.category || "writing",
    tags: data.tags || [],
    excerpt: data.excerpt || "",
    teaser: data.teaser || "",
    teaserShort: data.teaserShort || data.teaser || "",
    content,
    path: path.relative(postsDirectory, filePath),
  }
}

export function getAllContent(): MarkdownContent[] {
  return getAllMarkdownFiles()
    .map(getMarkdownContent)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}
```

---

## 3. Posts API Route — `app/api/posts/route.ts`

A simple GET endpoint that returns all content as JSON. The `SearchOverlay` fetches this once on mount and caches it client-side.

```typescript
import { NextResponse } from "next/server"
import { getAllContent } from "@/lib/markdown"

export async function GET() {
  const content = getAllContent()
  return NextResponse.json({ posts: content })
}
```

The response shape matches the `Post` interface used in the search component:
```json
{
  "posts": [
    {
      "slug": "bifidus",
      "title": "Bifidus",
      "date": "2026-03-18",
      "category": "Marginalia",
      "excerpt": "I went to Lidl after work...",
      "content": "I was in the cookie aisle...",
      ...
    }
  ]
}
```

---

## 4. The ⌘K Search Overlay — `components/SearchOverlay.tsx`

This is the core feature. Mount it **once** in `app/layout.tsx` so it's available site-wide.

### How it works

1. On mount: fetches `/api/posts` once, stores all posts in state (including full raw `content`).
2. Listens globally for `keydown` — `⌘K` / `Ctrl+K` opens/closes; `Escape` closes.
3. Also listens for a custom `"openSearch"` DOM event — other components can fire `window.dispatchEvent(new CustomEvent("openSearch"))` to open it programmatically (e.g. a search icon in the header).
4. As the user types, runs a pure client-side filter — no API call per keystroke.
5. Strips HTML from content (in case content was pre-rendered), matches title / excerpt / body with a word-boundary regex, extracts a 300-char context snippet around the match.
6. Renders results as links with GSAP fade-in stagger.

### Full component

```tsx
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { formatDate } from "@/lib/formatDate"

interface Post {
  slug: string
  title: string
  titleShort?: string
  date: string
  excerpt?: string
  teaser?: string
  content?: string
  matchSnippet?: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
}

function extractMatchContext(text: string, query: string): string {
  if (!text || !query) return ""
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = query.includes(" ")
    ? new RegExp(escaped, "i")
    : new RegExp(`\\b${escaped}\\b`, "i")
  const match = regex.exec(text)
  if (!match) return ""
  const start = Math.max(0, match.index - 150)
  const end = Math.min(text.length, match.index + query.length + 150)
  let snippet = text.slice(start, end)
  if (start > 0) snippet = "…" + snippet
  if (end < text.length) snippet = snippet + "…"
  return snippet.trim()
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(${escaped})`, "gi")
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-transparent text-white font-semibold">{part}</mark>
      : part
  )
}

function filterPosts(posts: Post[], query: string): Post[] {
  if (!query.trim()) return []
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = query.includes(" ")
    ? new RegExp(escaped, "i")
    : new RegExp(`\\b${escaped}\\b`, "i")

  return posts.reduce<Post[]>((acc, post) => {
    const cleanContent = post.content ? stripHtml(post.content) : ""
    const titleMatch = regex.test(post.title)
    const excerptMatch = post.excerpt ? regex.test(post.excerpt) : false
    const contentMatch = cleanContent ? regex.test(cleanContent) : false

    if (titleMatch || excerptMatch || contentMatch) {
      let matchSnippet = ""
      if (contentMatch && cleanContent) {
        matchSnippet = extractMatchContext(cleanContent, query) || post.excerpt || ""
      } else if (excerptMatch && post.excerpt) {
        matchSnippet = post.excerpt
      } else {
        matchSnippet = post.excerpt || ""
      }
      acc.push({ ...post, matchSnippet })
    }
    return acc
  }, [])
}

export default function SearchOverlay() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [results, setResults] = useState<Post[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Fetch all posts once on mount
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || d))
  }, [])

  const openOverlay = useCallback(() => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const closeOverlay = useCallback(() => {
    setOpen(false)
    setQuery("")
    setResults([])
  }, [])

  // ⌘K / Ctrl+K global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        open ? closeOverlay() : openOverlay()
      }
      if (e.key === "Escape" && open) closeOverlay()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, openOverlay, closeOverlay])

  // Custom event so any component can open the search
  useEffect(() => {
    const handler = () => openOverlay()
    window.addEventListener("openSearch", handler)
    return () => window.removeEventListener("openSearch", handler)
  }, [openOverlay])

  // Run filter on every query change
  useEffect(() => {
    const filtered = filterPosts(posts, query)
    setResults(filtered)
    if (resultsRef.current && filtered.length > 0) {
      const items = resultsRef.current.querySelectorAll(".search-result")
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }
      )
    }
  }, [query, posts])

  // Fade overlay in when opened
  useEffect(() => {
    if (open && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out" })
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col items-center"
      style={{ backgroundColor: "rgba(9,9,11,0.88)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) closeOverlay() }}
    >
      {/* Search input */}
      <div className="w-full max-w-2xl mt-[9rem] px-6">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search…"
          className="w-full bg-transparent border-none outline-none focus:ring-0 text-3xl text-zinc-100 placeholder:text-zinc-700 pb-4"
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            borderBottom: "1px solid #3A2E24",
          }}
        />
      </div>

      {/* Results */}
      <div
        ref={resultsRef}
        className="w-full max-w-2xl px-6 mt-10 overflow-y-auto"
        style={{ maxHeight: "60vh" }}
      >
        {query.trim() && results.length === 0 && (
          <p className="text-zinc-600 text-base" style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
            Nothing found.
          </p>
        )}

        {results.map((post) => (
          <Link
            key={post.slug}
            href={`/${post.slug}`}
            onClick={closeOverlay}
            className="search-result block mb-10 group"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-1"
               style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
              {formatDate(post.date)}
            </p>
            <h2 className="text-3xl leading-tight text-zinc-200 group-hover:text-white transition-colors mb-2"
                style={{ fontFamily: '"Schnyder S", Georgia, serif' }}>
              {highlightText(post.title, query)}
            </h2>
            {post.matchSnippet && (
              <p className="text-base text-zinc-500 leading-relaxed"
                 style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}>
                {highlightText(post.matchSnippet, query)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

## 5. Mount in Root Layout — `app/layout.tsx`

```tsx
import SearchOverlay from "@/components/SearchOverlay"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header>...</header>
        <SearchOverlay />   {/* ← mounted once, globally available */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

---

## 6. Trigger Search from Any Component

To open the overlay from a button or icon anywhere on the site:

```tsx
<button onClick={() => window.dispatchEvent(new CustomEvent("openSearch"))}>
  Search
</button>
```

---

## 7. Home Page Post List — `app/HomeClient.tsx`

The home page is a server component (`app/page.tsx`) that reads posts at build time and passes them to a client component for filtering and display.

### Key pattern: filter buttons + animated list

```tsx
const FILTERS = ["Essays", "Fiction", "Poetry", "Marginalia"] as const

// User can multi-select filters; empty set = show all
const [activeFilters, setActiveFilters] = useState<Set<Filter>>(new Set())
```

When filters change, GSAP fades the list out, updates state, then fades back in.

### Opening search from the home page

```tsx
function openSearch() {
  window.dispatchEvent(new CustomEvent("openSearch"))
}
```

Can be wired to a keyboard shortcut hint, a search icon, or a text link.

---

## 8. Color Palette

The site uses Tailwind's zinc scale remapped to warm tones via CSS overrides in `globals.css`:

```css
.text-zinc-100 { color: #EDEAE4 !important; }  /* parchment */
.text-zinc-500 { color: #96938E !important; }  /* warm taupe */
.text-zinc-600 { color: #7A7872 !important; }
.bg-zinc-950   { background-color: #0C0A08 !important; }  /* near-black */
.bg-zinc-900   { background-color: #1C1714 !important; }
```

Key accent color for borders: `#3A2E24` (dark warm brown).

---

## 9. Typography

Two typefaces, self-hosted as local `.woff2` files in `/public/fonts/`:

| Use | Font |
|-----|------|
| Headlines, titles, search input | `Schnyder S` (serif, weights 600 & 700) |
| Body, UI labels, metadata | `Graphik` (sans-serif, weights 300–900) |

In Tailwind:
```js
fontFamily: {
  sans: ["Graphik", "system-ui", "sans-serif"],
  serif: ["Schnyder S", "Georgia", "serif"],
}
```

---

## 10. Key npm Packages

```json
{
  "next": "16.1.1",
  "react": "19.2.3",
  "gsap": "^3.14.2",
  "gray-matter": "^4.0.3",
  "tailwindcss": "^3.4.19",
  "fuse.js": "^7.1.0",
  "@supabase/supabase-js": "^2.97.0"
}
```

`fuse.js` is installed but the active search uses regex-based filtering directly (faster for small corpora, returns exact match snippets).

---

## 11. Search Architecture Summary

```
User types query
       ↓
filterPosts(posts, query)          ← pure function, no network call
       ↓
word-boundary regex on:
  - post.title
  - post.excerpt
  - post.content (raw markdown, HTML-stripped)
       ↓
extractMatchContext()              ← 300-char window around first match
       ↓
highlightText()                    ← splits on regex, wraps match in <mark>
       ↓
GSAP stagger fade-in on results
```

All posts are loaded once at mount via `GET /api/posts`. The API reads from disk (markdown files) at request time — no database required for content. Supabase is only used for user auth.
