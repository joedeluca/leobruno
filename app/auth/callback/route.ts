import { NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leobruno.it"

  // Build the redirect response first so the Supabase client can write
  // session cookies directly onto it before we return
  const response = NextResponse.redirect(`${siteUrl}/account`)
  const supabase = createSupabaseMiddlewareClient(request, response)

  if (tokenHash && type) {
    // Magic link token from generateLink() — verify OTP, cookies land on response
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "email",
    })
    if (error) {
      console.error("verifyOtp error:", error)
      return NextResponse.redirect(`${siteUrl}/`)
    }
    return response
  }

  if (code) {
    // Standard OAuth/PKCE code exchange
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("exchangeCodeForSession error:", error)
      return NextResponse.redirect(`${siteUrl}/`)
    }
    return response
  }

  // Nothing useful — send them home
  return NextResponse.redirect(`${siteUrl}/`)
}
