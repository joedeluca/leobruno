import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Kit redirects here after email confirmation: /subscribed?email=...
// We treat the email as verified (Kit just proved ownership), create the
// Supabase auth user with email_confirm: true, generate a magic link token
// server-side, and redirect straight to /account — one email, one click, done.

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leobruno.it"
  const { searchParams, href } = new URL(request.url)
  const email = searchParams.get("email")

  // Log the full incoming URL so we can see exactly what Kit sent
  console.log("[/subscribed] incoming URL:", href)
  console.log("[/subscribed] email param:", email)

  // No email — Kit didn't pass the merge tag. Send home, /welcome is dead.
  if (!email) {
    console.log("[/subscribed] no email param — redirecting home")
    return NextResponse.redirect(`${siteUrl}/`)
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    // 1. Upsert auth user with email pre-confirmed — no Supabase verification email
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
    })

    if (createError && !createError.message.includes("already")) {
      console.error("[/subscribed] createUser error:", createError.message)
    }

    // 2. Generate magic link token server-side (no email sent by admin API)
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

    // 3. Hand the token to the callback route — it verifies and sets the session
    const callbackUrl = new URL(`${siteUrl}/auth/callback`)
    callbackUrl.searchParams.set("token_hash", linkData.properties.hashed_token)
    callbackUrl.searchParams.set("type", "magiclink")

    console.log("[/subscribed] redirecting to callback for:", normalizedEmail)
    return NextResponse.redirect(callbackUrl.toString())
  } catch (err) {
    console.error("[/subscribed] unexpected error:", err)
    return NextResponse.redirect(`${siteUrl}/`)
  }
}
