import { NextResponse } from "next/server"
import { getPoemBySlug } from "@/lib/poems"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const poem = getPoemBySlug(slug)

  if (!poem) {
    return NextResponse.json({ error: "Poem not found" }, { status: 404 })
  }

  return NextResponse.json({ poem })
}
