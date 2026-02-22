import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Kit confirmation redirect lands here: /subscribed?email={{ subscriber.email_address }}
// Auth user already exists (created at signup). We just generate a session token
// and redirect straight to /account — one email, one click, done.

export async function GET(request: NextRequest) {
  const siteUrl = process.env.SITE_URL ?? "https://leobruno.it"
  const email = request.nextUrl.searchParams.get("email")

  console.log("[/subscribed] email:", email, "siteUrl:", siteUrl)

  if (!email) {
    // No email — Kit confirmation URL isn't set correctly in Kit dashboard
    console.error(
      "[/subscribed] missing email param — check Kit confirmation URL setting"
    )
    return NextResponse.redirect(`${siteUrl}/`)
  }

  const normalizedEmail = email.trim().toLowerCase()

  // Generate magic link — admin API generates the token without sending an email
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
    options: { redirectTo: `${siteUrl}/account` },
  })

  if (error || !data?.properties?.hashed_token) {
    console.error("[/subscribed] generateLink failed:", error?.message)
    return NextResponse.redirect(`${siteUrl}/`)
  }

  // Hand the token to /auth/callback — it verifies OTP and sets the session
  const callbackUrl = new URL(`${siteUrl}/auth/callback`)
  callbackUrl.searchParams.set("token_hash", data.properties.hashed_token)
  callbackUrl.searchParams.set("type", "magiclink")

  return NextResponse.redirect(callbackUrl.toString())
}
