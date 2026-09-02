import type React from "react"

/* Typographic primitives. Every one of them is a plain server component —
   the page is static by design, so nothing here ships JS. */

type Kids = { children: React.ReactNode; className?: string }

export function Kicker({ children }: Kids) {
  return <div className="mag-kicker">{children}</div>
}

export function Head({
  size = "m",
  condensed,
  align,
  children,
}: {
  size?: "s" | "m" | "l" | "xl"
  condensed?: boolean
  align?: "left" | "center" | "right"
  children: React.ReactNode
}) {
  return (
    <h1 className="mag-head" data-size={size} data-cond={condensed ? "true" : undefined} style={align ? { textAlign: align } : undefined}>
      {children}
    </h1>
  )
}

export function Deck({ children }: Kids) {
  return <div className="mag-deck">{children}</div>
}

export function Byline({ children }: Kids) {
  return <div className="mag-byline">{children}</div>
}

export function Subhead({ children }: Kids) {
  return <div className="mag-subhead">{children}</div>
}

export function PullQuote({ attribution, children }: { attribution?: string; children: React.ReactNode }) {
  return (
    <div className="mag-pull">
      {children}
      {attribution ? <span className="mag-pull-attr">{attribution}</span> : null}
    </div>
  )
}

export function Caption({ credit, children }: { credit?: string; children: React.ReactNode }) {
  return (
    <div className="mag-caption">
      {children}
      {credit ? <span className="mag-credit"> {credit}</span> : null}
    </div>
  )
}

export function Rule({ weight = 0.5, color }: { weight?: number; color?: string }) {
  return <hr className="mag-rule" style={{ borderTopWidth: `${weight}pt`, borderTopColor: color }} />
}

/** Multi-column text block. Fills the frame; overflow is caught by the
 *  overset probe rather than silently clipped. */
export function Columns({
  cols,
  fill = "balance",
  children,
}: {
  cols: 2 | 3 | 4
  /** "balance" evens the column bottoms, the way a magazine sets them.
   *  "auto" fills each column to the frame height before starting the next —
   *  use it only when you want a deliberately ragged last column. */
  fill?: "balance" | "auto"
  children: React.ReactNode
}) {
  return (
    <div className="mag-cols" data-cols={cols} data-fill={fill === "auto" ? "auto" : undefined}>
      {children}
    </div>
  )
}

/**
 * Print-safe image. Deliberately NOT next/image: it lazy-loads by default, so
 * art on later pages never loads and prints as a blank frame, and its `sizes`
 * heuristic serves a ~1080w variant that is roughly 100dpi on paper.
 * Supply source art at >= 2550px on the long edge for a full-page bleed.
 */
export function Art({
  src,
  alt,
  fit = "cover",
  position,
}: {
  src: string
  alt: string
  fit?: "cover" | "contain"
  position?: string
}) {
  return (
    // biome-ignore lint/performance/noImgElement: next/image lazy-loads and downsamples; both are fatal in print
    <img
      className="mag-art"
      data-fit={fit}
      src={src}
      alt={alt}
      loading="eager"
      decoding="sync"
      style={position ? { objectPosition: position } : undefined}
    />
  )
}
