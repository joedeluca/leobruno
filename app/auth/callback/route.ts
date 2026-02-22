import { NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leobruno.it"

  const response = NextResponse.redirect(`${siteUrl}/account`)
  const supabase = createSupabaseMiddlewareClient(request, response)

  if (code) {
    // Standard OAuth/PKCE code exchange
    await supabase.auth.exchangeCodeForSession(code)
    return response
  }

  if (tokenHash && type) {
    // Magic link token from generateLink() — exchange for session
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "email",
    })
    return response
  }

  // Nothing useful — send them home
  return NextResponse.redirect(`${siteUrl}/`)
}
