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
          // Parse inline markdown: bold (**text**) and italic (_text_ or *text*)
          const parseInline = (text: string): React.ReactNode[] => {
            const parts: React.ReactNode[] = []
            const regex = /(\*\*(.+?)\*\*|_(.+?)_|\*(.+?)\*)/g
            let last = 0
            let match
            while ((match = regex.exec(text)) !== null) {
              if (match.index > last) parts.push(text.slice(last, match.index))
              if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>)
              else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>)
              else if (match[4]) parts.push(<em key={match.index}>{match[4]}</em>)
              last = match.index + match[0].length
            }
            if (last < text.length) parts.push(text.slice(last))
            return parts
          }
          return (
            <div key={index} className="poem-line-wrapper">
              {showLineNumbers && (
                <span className="poem-line-number">
                  {!isBlankLine ? index + 1 : ""}
                </span>
              )}
              <div className="poem-line">{isBlankLine ? "\u00A0" : parseInline(line)}</div>
            </div>
          )
        })}
      </div>
      {author && <div className="poem-author">— {author}</div>}
    </div>
  )
}
