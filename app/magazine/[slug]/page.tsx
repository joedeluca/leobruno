import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Reader from "@/components/magazine/Reader"
import { PIECES, getPiece } from "@/content/magazine/pieces"
import { renderSheets } from "@/lib/magazine/render"

export function generateStaticParams() {
  return Object.keys(PIECES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const piece = getPiece(slug)
  return piece ? { title: piece.title } : {}
}

export default async function MagazinePiecePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const piece = getPiece(slug)
  if (!piece) notFound()

  const pages = await renderSheets(piece)
  return <Reader pages={pages} title={piece.title} printHref={`/magazine/${slug}/print`} />
}
