import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug)
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })

  // Must be logged in
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Look up the newsletter row by slug
  const { data: newsletter } = await supabaseAdmin
    .from("newsletters")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!newsletter)
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })

  // Upsert — ignore if already recorded
  await supabaseAdmin
    .from("newsletter_reads")
    .upsert(
      { user_id: user.id, newsletter_id: newsletter.id },
      { onConflict: "user_id,newsletter_id" }
    )

  return NextResponse.json({ ok: true })
}
