"use client"

import { useState } from "react"

interface PoemDisplayProps {
  content: string
  author?: string
  showLineNumbers?: boolean
}

export default function PoemDisplay({
  content,
  author,
  showLineNumbers = false,
}: PoemDisplayProps) {
  // Check for epigraph
  const epigraphMatch = content.match(/\[EPIGRAPH\]([\s\S]*?)\[\/EPIGRAPH\]\n*/)
  const epigraphText = epigraphMatch ? epigraphMatch[1].trim() : null
  const poemText = epigraphMatch
    ? content.replace(/\[EPIGRAPH\][\s\S]*?\[\/EPIGRAPH\]\n*/, "")
    : content

  const lines = poemText.split("\n")

  return (
    <div className="poem-display" data-show-numbers={showLineNumbers}>
      {epigraphText && (
        <div className="poem-epigraph">
          {epigraphText.split("\n").map((line, index) => (
            <div key={`epigraph-${index}`}>{line}</div>
          ))}
        </div>
      )}
      <div className="poem-text">
        {lines.map((line, index) => {
          const isBlankLine = !line.trim()
          return (
            <div key={index} className="poem-line-wrapper">
              {showLineNumbers && (
                <span className="poem-line-number">
                  {!isBlankLine ? index + 1 : ""}
                </span>
              )}
              <div className="poem-line">{line || "\u00A0"}</div>
            </div>
          )
        })}
      </div>
      {author && <div className="poem-author">— {author}</div>}
    </div>
  )
}
