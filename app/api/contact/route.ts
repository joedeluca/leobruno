import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 3 // Max 3 emails per hour per IP
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

// Create transporter (reused across requests)
const transporter = nodemailer.createTransport({
  host: "smtp.mail.me.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.ICLOUD_APPLE_ID, // Your actual Apple ID
    pass: process.env.ICLOUD_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Sometimes needed for iCloud
  },
})

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      )
    }

    const { message } = await request.json()

    // Basic validation
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const trimmedMessage = message.trim()

    // Check word count (minimum 3 words)
    const wordCount = trimmedMessage
      .split(/\s+/)
      .filter((word) => word.length > 0).length

    if (wordCount < 3) {
      return NextResponse.json(
        { error: "Message must be at least 3 words" },
        { status: 400 }
      )
    }

    if (trimmedMessage.length > 10000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 })
    }

    // Send email via Nodemailer + iCloud
    const info = await transporter.sendMail({
      from: `"Leo Bruno" <${process.env.ICLOUD_EMAIL}>`, // Your @leobruno.it address
      to: process.env.ICLOUD_EMAIL, // Send to yourself
      subject: "New Fan Mail from leobruno.it",
      text: `New message received:\n\n${trimmedMessage}\n\n---\nSent from: ${ip}\nTimestamp: ${new Date().toISOString()}`,
      replyTo: process.env.ICLOUD_EMAIL,
    })

    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
