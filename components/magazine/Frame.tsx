import type React from "react"
import { PAGE, colLeft, colSpanWidth, lineTop, IN } from "@/lib/magazine/geometry"
import type { GridPos } from "@/lib/magazine/types"

export interface FrameProps extends GridPos {
  /** Required when the frame holds flowing copy — it is the key the overset
   *  probe reports, and the name you'll see in the print report. */
  id?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/** Resolve grid coordinates to absolute inches. Inline styles rather than
 *  calc() chains so the numbers are inspectable in devtools and identical
 *  in the PDF. */
export function frameStyle(p: GridPos): React.CSSProperties {
  if (p.bleed) {
    return { left: 0, top: 0, width: IN(PAGE.trimW), height: IN(PAGE.trimH) }
  }
  const left = p.x ?? colLeft(p.col ?? 1)
  const top = p.y ?? lineTop(p.line ?? 1)
  const width = p.w ?? colSpanWidth(p.span ?? 1)
  const height =
    p.h ??
    (p.lines !== undefined
      ? p.lines * PAGE.baseline
      : PAGE.margin + PAGE.liveH - top)
  return { left: IN(left), top: IN(top), width: IN(width), height: IN(height) }
}

export default function Frame({ id, className, style, children, ...pos }: FrameProps) {
  return (
    <div
      className={["mag-frame", className].filter(Boolean).join(" ")}
      data-frame={id}
      data-bleed={pos.bleed ? "true" : undefined}
      style={{ ...frameStyle(pos), ...style }}
    >
      {children}
    </div>
  )
}
