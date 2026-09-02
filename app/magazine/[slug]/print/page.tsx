import { notFound } from "next/navigation"
import { PIECES, getPiece } from "@/content/magazine/pieces"
import { renderSheets } from "@/lib/magazine/render"

export function generateStaticParams() {
  return Object.keys(PIECES).map((slug) => ({ slug }))
}

/**
 * The print target, and the page the PDF is generated from.
 *
 * Every leaf is in the DOM, in folio order, with no reader chrome — the reader
 * only mounts the spread you are looking at, so printing from it would print
 * one spread. This route is what "prints just as it appears" is measured
 * against.
 *
 * `?only=3` renders a single folio, for proofing one page without reprinting
 * the book. scripts/proof.mjs uses it to rasterise each page.
 */
export default async function MagazinePrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ only?: string }>
}) {
  const { slug } = await params
  const { only } = await searchParams
  const piece = getPiece(slug)
  if (!piece) notFound()

  const all = await renderSheets(piece)
  const n = only ? Number.parseInt(only, 10) : Number.NaN
  const pages = Number.isFinite(n) ? all.slice(n - 1, n) : all

  return (
    <div className="mag-root" data-print-target="true">
      <div className="mag-stage">
        <div className="mag-spreadwrap">
          <div className="mag-spread" style={{ flexDirection: "column" }}>
            {pages.map((p, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: folio order is the identity
              <div key={i}>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
