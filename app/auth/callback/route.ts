import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leobruno.it"

  console.log("[auth/callback] params:", {
    code: !!code,
    tokenHash: !!tokenHash,
    type,
  })

  const response = NextResponse.redirect(`${siteUrl}/account`)

  // Build the Supabase client so it writes session cookies onto the redirect response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "email",
    })
    if (error) {
      console.error("verifyOtp error:", error.message, error.status)
      return NextResponse.redirect(
        `${siteUrl}/?auth_error=${encodeURIComponent(error.message)}`
      )
    }
    return response
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("exchangeCodeForSession error:", error)
      return NextResponse.redirect(`${siteUrl}/`)
    }
    return response
  }

  return NextResponse.redirect(`${siteUrl}/`)
}
