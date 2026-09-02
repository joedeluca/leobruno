/**
 * Sellable ad inventory — sizes and placements, the way magazines sold them.
 *
 * This ships now as the SLOT layer only: named units with exact geometry and
 * a stable id per slot. Bookings, advertiser admin and metrics are deliberately
 * NOT built — but every slot rendered today already carries the identity those
 * will need, so adding them later never requires re-laying-out a page.
 *
 * All dimensions are the LIVE (type-safe) field in inches — what an advertiser
 * builds artwork to. Units are placed on the same 3-column grid as editorial,
 * so an ad and a column of body copy always share edges.
 */

import { PAGE, colSpanWidth } from "./geometry"

export type AdUnitId =
  | "full-page"
  | "two-thirds-vertical"
  | "half-horizontal"
  | "half-vertical"
  | "half-island"
  | "third-vertical"
  | "third-square"
  | "third-horizontal"
  | "quarter"
  | "sixth-vertical"
  | "sixth-horizontal"
  | "twelfth"

/** Where in the book — the half of the price that isn't size. */
export type PlacementClass =
  | "cover-2" // inside front
  | "cover-3" // inside back
  | "cover-4" // back cover
  | "opposite-toc"
  | "first-spread"
  | "far-forward"
  | "run-of-book"
  | "marketplace"

export interface AdUnit {
  id: AdUnitId
  label: string
  /** Live/type field in inches — the artwork field. */
  w: number
  h: number
  /** Fraction of a page, for rate-card maths. */
  pageEq: number
  /** Whether the unit is offered running to the page edge. */
  bleedable: boolean
}

const half = colSpanWidth(3) // 7.5
const twoThirds = colSpanWidth(2) // 4.9375
const oneThird = colSpanWidth(1) // 2.3125
/** Half the live width, one gutter removed — the vertical half-page measure. */
const halfW = (PAGE.liveW - PAGE.gutter) / 2 // 3.59375

export const AD_UNITS: Record<AdUnitId, AdUnit> = {
  "full-page": { id: "full-page", label: "Full Page", w: half, h: 10, pageEq: 1, bleedable: true },
  "two-thirds-vertical": { id: "two-thirds-vertical", label: "2/3 Page Vertical", w: twoThirds, h: 10, pageEq: 2 / 3, bleedable: true },
  "half-horizontal": { id: "half-horizontal", label: "1/2 Page Horizontal", w: half, h: 4.875, pageEq: 0.5, bleedable: true },
  "half-vertical": { id: "half-vertical", label: "1/2 Page Vertical", w: halfW, h: 10, pageEq: 0.5, bleedable: true },
  "half-island": { id: "half-island", label: "1/2 Page Island (Junior)", w: twoThirds, h: 7.5, pageEq: 0.5, bleedable: false },
  "third-vertical": { id: "third-vertical", label: "1/3 Page Vertical", w: oneThird, h: 10, pageEq: 1 / 3, bleedable: true },
  "third-square": { id: "third-square", label: "1/3 Page Square", w: twoThirds, h: 4.875, pageEq: 1 / 3, bleedable: false },
  "third-horizontal": { id: "third-horizontal", label: "1/3 Page Horizontal", w: half, h: 3.25, pageEq: 1 / 3, bleedable: true },
  quarter: { id: "quarter", label: "1/4 Page", w: halfW, h: 4.875, pageEq: 0.25, bleedable: false },
  "sixth-vertical": { id: "sixth-vertical", label: "1/6 Page Vertical", w: oneThird, h: 4.875, pageEq: 1 / 6, bleedable: false },
  "sixth-horizontal": { id: "sixth-horizontal", label: "1/6 Page Horizontal", w: twoThirds, h: 2.3125, pageEq: 1 / 6, bleedable: false },
  twelfth: { id: "twelfth", label: "1/12 Page (Marketplace)", w: oneThird, h: 2.25, pageEq: 1 / 12, bleedable: false },
}

/** Artwork pixel dimensions to quote on the spec sheet. */
export function artworkPx(unit: AdUnit, dpi = 300) {
  return { w: Math.round(unit.w * dpi), h: Math.round(unit.h * dpi) }
}

export const PLACEMENT_LABELS: Record<PlacementClass, string> = {
  "cover-2": "Cover 2 — Inside Front",
  "cover-3": "Cover 3 — Inside Back",
  "cover-4": "Cover 4 — Back Cover",
  "opposite-toc": "Opposite Contents",
  "first-spread": "First Spread",
  "far-forward": "Far Forward",
  "run-of-book": "Run of Book",
  marketplace: "Marketplace",
}
