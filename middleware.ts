import { NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase"

export async function middleware(request: NextRequest) {
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

export const config = {
  matcher: ["/account/:path*", "/auth/callback"],
}
