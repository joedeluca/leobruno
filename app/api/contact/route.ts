import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // Max 5 emails per hour per IP
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

// Format date nicely: "Saturday, June 3, 2026 at 3:45 PM"
function formatDate(date: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayName = days[date.getDay()]
  const monthName = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12

  return `${dayName}, ${monthName} ${day}, ${year} at ${hours}:${minutes} ${ampm}`
}

// Get location from IP using ipapi.co (free, no key required for 1k/day)
async function getLocation(ip: string): Promise<string> {
  // Handle local/unknown IPs
  if (
    ip === "unknown" ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return "Local/Unknown"
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2s timeout

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: { "User-Agent": "leobruno-contact-form" },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return "Unknown"
    }

    const data = await response.json()

    const parts = []
    if (data.city) parts.push(data.city)
    if (data.region) parts.push(data.region)
    if (data.country_name) parts.push(data.country_name)

    return parts.length > 0 ? parts.join(", ") : "Unknown"
  } catch (error) {
    // Silently fail and return Unknown if geolocation fails
    return "Unknown"
  }
}

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

export async function POST(request: Request) {
  try {
    // Check environment variables
    if (
      !process.env.ICLOUD_APPLE_ID ||
      !process.env.ICLOUD_APP_PASSWORD ||
      !process.env.ICLOUD_EMAIL
    ) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      )
    }

    // Create transporter inside handler for serverless compatibility
    const transporter = nodemailer.createTransport({
      host: "smtp.mail.me.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ICLOUD_APPLE_ID,
        pass: process.env.ICLOUD_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

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
    const timestamp = new Date()
    const formattedDate = formatDate(timestamp)
    const location = await getLocation(ip)

    const info = await transporter.sendMail({
      from: `"Leo Bruno" <${process.env.ICLOUD_EMAIL}>`,
      to: process.env.ICLOUD_EMAIL,
      subject: "New Fan Mail from leobruno.it",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="font-size: 18px; line-height: 1.6; color: #1f2937; white-space: pre-wrap; margin: 20px 0;">${trimmedMessage}</div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <div style="font-size: 13px; color: #6b7280;">
            <p><strong>From:</strong> ${location}</p>
            <p><strong>IP:</strong> ${ip}</p>
            <p><strong>Time:</strong> ${formattedDate}</p>
          </div>
        </div>
      `,
      text: `\n\n${trimmedMessage}\n\n---\nFrom: ${location}\nIP: ${ip}\nTime: ${formattedDate}`,
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
