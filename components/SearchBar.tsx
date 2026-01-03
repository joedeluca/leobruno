"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"

interface SearchResult {
  slug: string
  title: string
  date: string
  excerpt: string
  category: string
  tags: string[]
  matchedIn: string[] // where the match was found: 'title', 'content', 'excerpt', 'tags'
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    )
  }

  // GSAP animation for search results
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll(".result-item")
      gsap.fromTo(
        items,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      )
    }
  }, [results])

  // Debounced search
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true)
        const params = new URLSearchParams({ q: query })

        const response = await fetch(`/api/search?${params}`)
        const data = await response.json()
        setResults(data)
        setIsSearching(false)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {isSearching && <div>Searching...</div>}

      {query && results.length > 0 && (
        <div ref={resultsRef}>
          {results.map((item) => (
            <a key={item.slug} href={`/${item.slug}`} className="result-item">
              <div>
                <h3>{highlightText(item.title, query)}</h3>
                <span>{item.category}</span>
              </div>

              <div>
                <span>Found in: </span>
                {item.matchedIn.map((field, idx) => (
                  <span key={field}>
                    {field}
                    {idx < item.matchedIn.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>

              <p>{highlightText(item.excerpt, query)}</p>

              <div>
                <span>{item.date}</span>
                {item.tags.length > 0 && (
                  <div>
                    {item.tags.map((tag) => (
                      <span key={tag}>{highlightText(`#${tag}`, query)}</span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {query && !isSearching && results.length === 0 && <div>Nada</div>}
    </div>
  )
}
