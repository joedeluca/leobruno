import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabase } from "@/lib/supabase"
import nodemailer from "nodemailer"

const SITE_URL =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://leobruno.it"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function notifyNewSubscriber(email: string, firstName?: string) {
  if (
    !process.env.ICLOUD_APPLE_ID ||
    !process.env.ICLOUD_APP_PASSWORD ||
    !process.env.ICLOUD_EMAIL
  )
    return

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.mail.me.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ICLOUD_APPLE_ID,
        pass: process.env.ICLOUD_APP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    })

    const name = firstName?.trim() ? ` (${firstName.trim()})` : ""

    await transporter.sendMail({
      from: `"Leo Bruno" <${process.env.ICLOUD_EMAIL}>`,
      to: process.env.ICLOUD_EMAIL,
      subject: `New subscriber: ${email}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto;">
          <p style="font-size: 16px; color: #1f2937;">
            <strong>${email}</strong>${name} just subscribed on leobruno.it.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            ${new Date().toLocaleString("en-US", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>
      `,
      text: `New subscriber: ${email}${name}\n${new Date().toISOString()}`,
    })
  } catch (err) {
    // Non-fatal — don't let this break the subscription flow
    console.error("Subscriber notification email failed:", err)
  }
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
      // Already subscribed — send a login link so they can access /account
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${SITE_URL}/auth/confirm`,
          shouldCreateUser: false,
        },
      })
      if (otpError)
        console.error("signInWithOtp (existing) error:", otpError.message)
      return NextResponse.json({
        success: true,
        message: "Check your email for a sign-in link.",
      })
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

      // Notify — fire and forget, non-blocking
      notifyNewSubscriber(normalizedEmail, first_name)
    }

    // Use anon client — service role client generates tokens that can't be verified by users
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/confirm`,
        data: { first_name: first_name?.trim() || null },
        shouldCreateUser: true,
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
