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
      return NextResponse.json(
        { error: "You're already subscribed." },
        { status: 409 }
      )
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

    // signInWithOtp sends the email via Supabase SMTP (Resend)
    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback`,
        data: { first_name: first_name?.trim() || null },
        shouldCreateUser: false,
      },
    })

    if (otpError) {
      console.error("signInWithOtp error:", otpError.message)
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
