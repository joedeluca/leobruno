import type { PieceSpec } from "@/lib/magazine/types"
import friction from "./friction-is-the-business"

/** Every laid-out piece. Add a file, add a line. */
export const PIECES: Record<string, PieceSpec> = {
  [friction.id]: friction,
}

export function getPiece(slug: string): PieceSpec | undefined {
  return PIECES[slug]
}
