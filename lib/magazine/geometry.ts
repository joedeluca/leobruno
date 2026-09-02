/**
 * The physical magazine. One source of truth — the CSS custom properties in
 * app/magazine.css mirror these numbers and scripts/verify-print.mjs asserts
 * the rendered PDF agrees with them.
 *
 * Everything is in INCHES. The page is a physical object: no px, no rem, no
 * viewport units, no breakpoints. A page looks the same on a phone, on a
 * desktop and on paper — only the zoom applied to the whole sheet changes.
 *
 * Trim is 8.5 x 11in — American magazine standard, the size Playboy ran at.
 * The grid is built on sixteenths so every column edge is exact:
 *   3 x 2.3125 + 2 x 0.3125 = 7.5in   (no rounding, ever)
 */

export const PAGE = {
  /** Trim size. The PDF page is exactly this, so art running to the page
   *  edge is a true bleed with no crop marks and nothing to cut. */
  trimW: 8.5,
  trimH: 11,

  /** Uniform margins. Equal on all four edges because the artifact of record
   *  is a PDF, which has no binding to steal the gutter. */
  margin: 0.5,

  /** Type page — the live area all editorial and all ad units sit inside. */
  liveW: 7.5,
  liveH: 10,

  /** Column grid. */
  cols: 3,
  colW: 2.3125,
  gutter: 0.3125,

  /** Baseline grid: 12pt = 1/6in. 10in of live height = exactly 60 lines. */
  baseline: 12 / 72,
  lines: 60,

  /** Press bleed. Unused while the PDF page is the trim; kept because the
   *  ad rate card quotes bleed dimensions to advertisers and a real press
   *  export would need it. */
  bleed: 0.125,
} as const

/** Column x-origins on any page: 0.5, 3.125, 5.75 */
export const COL_X: readonly number[] = Array.from(
  { length: PAGE.cols },
  (_, i) => PAGE.margin + i * (PAGE.colW + PAGE.gutter)
)

/** Width of a run of `span` columns, gutters included. */
export function colSpanWidth(span: number): number {
  return span * PAGE.colW + (span - 1) * PAGE.gutter
}

/** Left edge of grid column `col` (1-based). */
export function colLeft(col: number): number {
  return PAGE.margin + (col - 1) * (PAGE.colW + PAGE.gutter)
}

/** Top edge of baseline `line` (1-based, 1..60). */
export function lineTop(line: number): number {
  return PAGE.margin + (line - 1) * PAGE.baseline
}

/** An arbitrary column measure for n equal columns across the live width. */
export function measureFor(n: number): number {
  return (PAGE.liveW - (n - 1) * PAGE.gutter) / n
}

export const IN = (n: number) => `${+n.toFixed(6)}in`

/** Page aspect — used by the viewer to size the stage before art loads. */
export const ASPECT = PAGE.trimW / PAGE.trimH

/** CSS px at 96dpi, for the screen viewer's fit math only. Never for layout. */
export const PX_PER_IN = 96
export const PAGE_PX = { w: PAGE.trimW * PX_PER_IN, h: PAGE.trimH * PX_PER_IN }
