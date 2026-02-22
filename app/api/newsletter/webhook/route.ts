import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Kit webhook event types we handle
type KitWebhookEvent = {
  type: string
  subscriber?: {
    id: number
    email_address: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as KitWebhookEvent

    // Only handle unsubscribe events
    if (body.type !== "subscriber.unsubscribe") {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const email = body.subscriber?.email_address

    if (!email) {
      return NextResponse.json(
        { error: "No email in payload." },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("subscribers")
      .update({ status: "unsubscribed" })
      .eq("email", email.trim().toLowerCase())

    if (error) {
      console.error("Supabase unsubscribe update error:", error)
      return NextResponse.json(
        { error: "Failed to update subscriber status." },
        { status: 500 }
      )
    }

    return NextResponse.json({ received: true, status: "unsubscribed" })
  } catch (err) {
    console.error("Webhook route error:", err)
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 })
  }
}
