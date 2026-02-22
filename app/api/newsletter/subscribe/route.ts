import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

const SITE_URL =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://leobruno.it"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, first_name } = body as {
      email?: string
      first_name?: string
    }

    // Validate
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      )
    }

    // Check for existing subscriber in Supabase
    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("id, status")
      .eq("email", normalizedEmail)
      .single()

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "You're already subscribed." },
          { status: 409 }
        )
      }

      // Re-activate if previously unsubscribed
      await supabaseAdmin
        .from("subscribers")
        .update({ status: "active" })
        .eq("id", existing.id)
    } else {
      // Insert new subscriber into Supabase
      const { error: insertError } = await supabaseAdmin
        .from("subscribers")
        .insert({
          email: normalizedEmail,
          first_name: first_name?.trim() || null,
          status: "active",
          source: "website",
        })

      if (insertError) {
        console.error("Supabase insert error:", insertError)
        return NextResponse.json(
          { error: "Failed to save subscription. Please try again." },
          { status: 500 }
        )
      }
    }

    // Create (or silently skip if already exists) the Supabase auth user.
    // email_confirm: false → Supabase sends a magic link email immediately.
    // The link points to /auth/callback, which verifies the token and
    // redirects to /account. Kit is not involved in this flow.
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: false,
      app_metadata: { redirect_to: `${SITE_URL}/auth/callback` },
    })

    if (createError) {
      const msg = createError.message.toLowerCase()
      if (msg.includes("already") || msg.includes("already registered")) {
        // User exists — send a fresh magic link so they can access /account
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: normalizedEmail,
          options: { redirectTo: `${SITE_URL}/auth/callback` },
        })
      } else {
        console.error("createUser error:", createError.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Check your email for a confirmation link.",
    })
  } catch (err) {
    console.error("Subscribe route error:", err)
    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 }
    )
  }
}
