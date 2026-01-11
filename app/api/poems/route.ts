import { NextResponse } from "next/server"
import { getAllPoems } from "@/lib/poems"

export async function GET() {
  const poems = getAllPoems()
  return NextResponse.json({ poems })
}
