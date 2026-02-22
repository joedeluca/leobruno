import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const { slug, title, type, url } = await req.json()
  if (!slug || !title || !url)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await supabaseAdmin.from("reads").upsert(
    {
      user_id: user.id,
      slug,
      title,
      type: type ?? "post",
      url,
      read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,slug" }
  )

  return NextResponse.json({ ok: true })
}
