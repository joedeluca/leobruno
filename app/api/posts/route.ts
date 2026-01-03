import { NextResponse } from "next/server"
import { getAllContent } from "@/lib/markdown"

export async function GET() {
  const content = getAllContent()
  return NextResponse.json({ posts: content })
}
