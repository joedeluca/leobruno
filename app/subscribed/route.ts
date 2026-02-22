import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Kit redirects here after email confirmation: /subscribed?email=...
// We treat the email as verified (Kit just proved ownership), create the
// Supabase auth user with email_confirm: true, generate a magic link token
// server-side, and redirect straight to /account — one email, one click, done.

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leobruno.it"
  const { searchParams, href } = new URL(request.url)

  // Try query param first (future-proofing), then fall back to cookie
  const emailParam = searchParams.get("email")
  const emailCookie = request.cookies.get("pending_subscriber")?.value
  const rawEmail = emailParam || (emailCookie ? decodeURIComponent(emailCookie) : null)

  console.log("[/subscribed] incoming URL:", href)
  console.log("[/subscribed] email param:", emailParam, "| cookie:", emailCookie)

  if (!rawEmail) {
    console.log("[/subscribed] no email found — redirecting home")
    return NextResponse.redirect(`${siteUrl}/`)
  }

  const normalizedEmail = rawEmail.trim().toLowerCase()

  try {
    // 1. Upsert auth user with email pre-confirmed — no Supabase verification email
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
    })

    if (createError && !createError.message.includes("already")) {
      console.error("[/subscribed] createUser error:", createError.message)
    }

    // 2. Generate magic link token server-side (admin API does not send an email)
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
        options: { redirectTo: `${siteUrl}/account` },
      })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[/subscribed] generateLink error:", linkError)
      return NextResponse.redirect(`${siteUrl}/`)
    }

    // 3. Hand token to callback — clear the pending cookie on the way out
    const callbackUrl = new URL(`${siteUrl}/auth/callback`)
    callbackUrl.searchParams.set("token_hash", linkData.properties.hashed_token)
    callbackUrl.searchParams.set("type", "magiclink")

    console.log("[/subscribed] redirecting to callback for:", normalizedEmail)

    const response = NextResponse.redirect(callbackUrl.toString())
    response.cookies.set("pending_subscriber", "", { path: "/", maxAge: 0 })
    return response
  } catch (err) {
    console.error("[/subscribed] unexpected error:", err)
    return NextResponse.redirect(`${siteUrl}/`)
  }
}
