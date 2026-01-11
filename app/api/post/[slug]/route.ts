import { NextRequest, NextResponse } from "next/server"
import { getPostData } from "@/lib/posts"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const post = await getPostData(slug)
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }
}
