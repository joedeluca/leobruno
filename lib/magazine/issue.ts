import type { PieceSpec, PlacedSheet } from "./types"

/**
 * Assign real, sequential folios.
 *
 * Folio 1 is a recto, so odd folios are rectos and even folios are versos —
 * the one parity rule in the system. `@page :left`/`:right` is never used:
 * Chromium derives its parity from the print job's page count, which desyncs
 * the moment a piece is printed on its own.
 *
 * A page consumes a folio whether or not it prints one, so a silent folio on
 * a cover or a full-bleed ad can never let the numbering drift out of step
 * with the physical position.
 */
export function placePiece(piece: PieceSpec, startFolio = 1): PlacedSheet[] {
  return piece.sheets.map((spec, index) => {
    const folio = startFolio + index
    return {
      pieceId: piece.id,
      index,
      folio,
      side: folio % 2 === 1 ? "recto" : "verso",
      spec,
      runningHead: spec.runningHead ?? piece.runningHead,
    }
  })
}
