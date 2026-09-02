import type React from "react"
import type { PieceCopy } from "./copy"

export type PageSide = "recto" | "verso"
export type PageGround = "light" | "dark"
export type FolioMode = "auto" | "silent"

/** Position on the page grid. col/line are 1-based.
 *  `x/y/w/h` (inches, as numbers) are the escape hatch for art that ignores
 *  the grid — full-bleed images, hand-placed display type. */
export interface GridPos {
  col?: number
  span?: number
  line?: number
  lines?: number
  x?: number
  y?: number
  w?: number
  h?: number
  /** Run to the page edge, ignoring margins and grid entirely. */
  bleed?: boolean
}

export interface SheetContext {
  folio: number
  side: PageSide
  /** slot name -> rendered HTML, split out of the piece's markdown */
  copy: Record<string, string>
}

export interface SheetSpec {
  ground?: PageGround
  folioMode?: FolioMode
  /** Printed at the foot next to the folio. */
  runningHead?: string
  render: (ctx: SheetContext) => React.ReactNode
}

export interface PieceSpec {
  id: string
  title: string
  kind: "piece" | "ad" | "cover" | "toc"
  /** Markdown file supplying the copy slots. Omit for ads and covers. */
  copySource?: string
  /**
   * Map the piece's markdown onto the named slots its layout asks for.
   * Lives next to the layout because it IS a layout decision — which block of
   * prose lands in which frame.
   */
  copyMap?: (copy: PieceCopy) => Record<string, string>
  runningHead?: string
  sheets: SheetSpec[]
}

/** A sheet once the issue has assigned it a real folio. */
export interface PlacedSheet {
  pieceId: string
  index: number
  folio: number
  side: PageSide
  spec: SheetSpec
  runningHead?: string
}
