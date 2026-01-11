"use client"

import { useState } from "react"
import Link from "next/link"

interface Poem {
  slug: string
  title: string
  author: string
  date: string
  collection?: string
}

interface CollectionAccordionProps {
  collectionName: string
  collectionYear: string
  poems: Poem[]
}

export default function CollectionAccordion({
  collectionName,
  collectionYear,
  poems,
}: CollectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Check if year is already in the collection name
  const showYear = !collectionName.includes(collectionYear)

  return (
    <div className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors flex items-center justify-between normal-text"
      >
        <div className="flex items-baseline gap-3">
          <span className="text-zinc-300">{collectionName}</span>
          {showYear && (
            <span className="text-zinc-500">({collectionYear})</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">
            {poems.length} {poems.length === 1 ? "poem" : "poems"}
          </span>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <ul className="list-none pl-0 px-4 my-0">
          {poems.map((poem) => (
            <li key={poem.slug} className="px-4">
              <Link
                href={`/poems/${poem.slug}`}
                className="text-zinc-400 hover:text-zinc-100 transition-colors normal-text"
              >
                {poem.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
