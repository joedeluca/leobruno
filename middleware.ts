import { NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase"
import { NEWSLETTER_ON } from "@/lib/features"

export async function middleware(request: NextRequest) {
  // Newsletter off: all of its addresses (the matcher below) show the site's not-found page.
  if (!NEWSLETTER_ON) {
    return NextResponse.rewrite(new URL("/404", request.url), { status: 404 })
  }

  const response = NextResponse.next({ request })
  const supabase = createSupabaseMiddlewareClient(request, response)

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /account — redirect unauthenticated users home
  if (request.nextUrl.pathname.startsWith("/account") && !user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}

// Everything here belongs to the newsletter. With it on, only /account and /auth/callback
// need the session work above; the rest pass straight through it.
export const config = {
  matcher: [
    "/account/:path*",
    "/auth/:path*",
    "/newsletter/:path*",
    "/api/newsletter/:path*",
    "/subscribed",
    "/welcome",
    "/history/content/newsletter/:path*",
  ],
}
