import { NextRequest, NextResponse } from "next/server"
import Fuse from "fuse.js"
import { getAllContent } from "@/lib/markdown"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category")

  // If no query, return empty results
  if (!query) {
    return NextResponse.json([])
  }

  let content = getAllContent()

  // Filter by category if specified
  if (category) {
    content = content.filter((item) => item.category === category)
  }

  // Configure Fuse.js for fuzzy search - search all fields
  const fuse = new Fuse(content, {
    keys: ["title", "content", "excerpt", "tags"],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
  })

  const results = fuse.search(query)

  // Map results to include which fields matched
  const resultsWithMatches = results.map((result) => {
    const matchedIn = new Set<string>()

    if (result.matches) {
      result.matches.forEach((match) => {
        if (match.key) {
          matchedIn.add(match.key)
        }
      })
    }

    return {
      ...result.item,
      matchedIn: Array.from(matchedIn),
    }
  })

  return NextResponse.json(resultsWithMatches)
}
