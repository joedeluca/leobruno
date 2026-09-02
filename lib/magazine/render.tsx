import type React from "react"
import Page from "@/components/magazine/Page"
import { getPieceCopy } from "./copy"
import { placePiece } from "./issue"
import type { PieceSpec } from "./types"

/** Build a piece's leaves, in folio order, with copy resolved. */
export async function renderSheets(piece: PieceSpec): Promise<React.ReactNode[]> {
  const copy = piece.copySource ? await getPieceCopy(piece.copySource) : null
  const named = copy && piece.copyMap ? piece.copyMap(copy) : (copy?.slots ?? {})

  return placePiece(piece).map((placed) => (
    <Page
      key={placed.folio}
      folio={placed.folio}
      side={placed.side}
      ground={placed.spec.ground}
      folioMode={placed.spec.folioMode}
      runningHead={placed.runningHead}
    >
      {placed.spec.render({ folio: placed.folio, side: placed.side, copy: named })}
    </Page>
  ))
}
