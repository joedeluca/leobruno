import type React from "react"
import type { FolioMode, PageGround, PageSide } from "@/lib/magazine/types"

export interface PageProps {
  folio: number
  side: PageSide
  ground?: PageGround
  folioMode?: FolioMode
  runningHead?: string
  guides?: boolean
  children: React.ReactNode
}

/**
 * One leaf of the magazine — exactly 8.5 x 11in, on screen and in the PDF.
 * Nothing inside ever reflows; the page is a fixed canvas.
 */
export default function Page({
  folio,
  side,
  ground = "light",
  folioMode = "auto",
  runningHead,
  guides = false,
  children,
}: PageProps) {
  return (
    <div
      className="mag-page"
      data-folio-n={folio}
      data-side={side}
      data-ground={ground}
      data-folio={folioMode}
      data-guides={guides ? "true" : undefined}
    >
      {children}
      <div className="mag-folio">
        <span>{folio}</span>
        {runningHead ? (
          <>
            <span className="mag-folio-rule">|</span>
            <span>{runningHead}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}
