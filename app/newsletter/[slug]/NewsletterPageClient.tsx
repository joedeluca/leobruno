"use client"

import { useState } from "react"
import { formatArticleDate } from "@/lib/formatDate"
import ArticleTrace, { TraceButton } from "@/components/ArticleTrace"

interface Props {
  slug: string
  title: string
  date: string
  contentHtml: string
  rawContent: string
}

export default function NewsletterPageClient({
  slug,
  title,
  date,
  contentHtml,
  rawContent,
}: Props) {
  const [traceOpen, setTraceOpen] = useState(false)

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <p
        className="text-xs uppercase tracking-wider text-zinc-500 mb-8"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        Newsletter
      </p>

      <h1
        className="text-3xl text-zinc-100 mb-3 leading-tight"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        {title}
      </h1>

      {date && (
        <div
          className="text-zinc-600 text-sm mb-12 flex items-center gap-3"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          <span>{formatArticleDate(date)}</span>
          <span className="text-zinc-800 select-none">·</span>
          <TraceButton
            onClick={() => setTraceOpen((v) => !v)}
            isOpen={traceOpen}
          />
        </div>
      )}

      <div
        className="prose prose-invert prose-zinc max-w-none"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <ArticleTrace
        filePath={`content/newsletter/${slug}`}
        currentContent={rawContent}
        isOpen={traceOpen}
        onToggle={() => setTraceOpen((v) => !v)}
      />
    </div>
  )
}
