import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Kit redirects here after email confirmation: /subscribed?email=...
// We treat the email as verified (Kit just proved ownership), create the
// Supabase auth user with email_confirm: true, generate a magic link token
// server-side, and redirect straight to /account — one email, one click, done.

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leobruno.it"
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  // No email param — Kit didn't pass it, just show the static landing
  if (!email) {
    return NextResponse.redirect(`${siteUrl}/welcome`)
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    // 1. Ensure auth user exists, email pre-confirmed (no verification email sent)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === normalizedEmail
    )

    if (!existingUser) {
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true, // Kit already verified — skip Supabase email entirely
      })

      if (createError && createError.message !== "User already registered") {
        console.error("Create user error:", createError)
        return NextResponse.redirect(`${siteUrl}/welcome`)
      }
    }

    // 2. Generate a magic link token server-side — no email is sent via generateLink
    //    when called from admin, we just use the hashed_token it returns
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
        options: {
          redirectTo: `${siteUrl}/account`,
        },
      })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("Generate link error:", linkError)
      return NextResponse.redirect(`${siteUrl}/welcome`)
    }

    // 3. Redirect to auth callback with the token — client exchanges it for a session
    const token = linkData.properties.hashed_token
    const callbackUrl = new URL(`${siteUrl}/auth/callback`)
    callbackUrl.searchParams.set("token_hash", token)
    callbackUrl.searchParams.set("type", "magiclink")

    return NextResponse.redirect(callbackUrl.toString())
  } catch (err) {
    console.error("Subscribed route error:", err)
    return NextResponse.redirect(`${siteUrl}/welcome`)
  }
}
