import type React from "react"
import { AD_UNITS, type AdUnitId, type PlacementClass, artworkPx } from "@/lib/magazine/adUnits"
import { IN, colLeft, lineTop } from "@/lib/magazine/geometry"
import type { GridPos } from "@/lib/magazine/types"

export interface AdSlotProps extends Omit<GridPos, "w" | "h"> {
  /**
   * Stable, hand-assigned slot id — e.g. "friction/c4". This is the identity a
   * booking is sold against, and it must NOT be derived from the page number:
   * re-laying-out a piece so page 7 becomes page 9 must not move or void a
   * sold slot. The folio is derived metadata; this key is canonical.
   */
  id: string
  unit: AdUnitId
  placement?: PlacementClass
  children?: React.ReactNode
}

/**
 * A sellable rectangle. Ships with geometry and identity only — no booking,
 * no creative pipeline, no metrics. Those are designed but deliberately not
 * built; because the slot already carries its id, unit and placement, adding
 * them later never requires touching a layout.
 */
export default function AdSlot({ id, unit, placement = "run-of-book", children, ...pos }: AdSlotProps) {
  const u = AD_UNITS[unit]
  const px = artworkPx(u)

  // The slot's size is the unit's size — never hand-written, so a slot can
  // never quietly stop matching the unit an advertiser paid for.
  const left = pos.bleed ? 0 : (pos.x ?? colLeft(pos.col ?? 1))
  const top = pos.bleed ? 0 : (pos.y ?? lineTop(pos.line ?? 1))
  const width = pos.bleed ? 8.5 : u.w
  const height = pos.bleed ? 11 : u.h

  return (
    <div
      className="mag-slot"
      data-folio-slot={id}
      data-folio-unit={unit}
      data-folio-placement={placement}
      style={{ left: IN(left), top: IN(top), width: IN(width), height: IN(height) }}
    >
      {children ?? (
        <div className="mag-slot-empty">
          <b>{u.label}</b>
          <span>
            {u.w}″ × {u.h}″ · {px.w}×{px.h}px @300dpi
          </span>
          <span>{id}</span>
        </div>
      )}
    </div>
  )
}
