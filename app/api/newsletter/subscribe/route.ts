import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

const KIT_API_KEY = process.env.KIT_API_KEY!
const KIT_FORM_ID = process.env.KIT_FORM_ID!
const KIT_API_BASE = "https://api.convertkit.com/v3"

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

    // Sync to Kit
    const kitResponse = await fetch(
      `${KIT_API_BASE}/forms/${KIT_FORM_ID}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: KIT_API_KEY,
          email: normalizedEmail,
          first_name: first_name?.trim() || undefined,
        }),
      }
    )

    if (!kitResponse.ok) {
      const kitError = await kitResponse.text()
      console.error("Kit API error:", kitError)
      // Subscriber is in Supabase — don't fail the whole request.
      // Log and continue; a background sync can catch Kit failures later.
    } else {
      const kitData = (await kitResponse.json()) as {
        subscription?: { subscriber?: { id?: number } }
      }
      const kitSubscriberId = kitData?.subscription?.subscriber?.id

      if (kitSubscriberId) {
        await supabaseAdmin
          .from("subscribers")
          .update({ kit_subscriber_id: String(kitSubscriberId) })
          .eq("email", normalizedEmail)
      }
    }

    const isProd = process.env.NODE_ENV === "production"
    // SameSite=None;Secure required for cross-site redirect from Kit's confirmation email.
    // In dev (HTTP) fall back to Lax so the cookie still works on localhost.
    const cookieFlags = isProd
      ? "SameSite=None; Secure"
      : "SameSite=Lax"
    return NextResponse.json(
      { success: true, message: "Subscribed successfully." },
      {
        status: 200,
        headers: {
          "Set-Cookie": `pending_subscriber=${encodeURIComponent(normalizedEmail)}; Path=/; Max-Age=3600; ${cookieFlags}`,
        },
      }
    )
  } catch (err) {
    console.error("Subscribe route error:", err)
    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 }
    )
  }
}
