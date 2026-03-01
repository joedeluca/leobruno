import type { Metadata } from "next"
import "./globals.css"
import HeaderLogo from "@/components/HeaderLogo"
import PoemLinkHandler from "@/components/PoemLinkHandler"
import Footer from "@/components/Footer"
import AudioPlayer from "@/components/AudioPlayer"
import Link from "next/link"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "Leo Bruno",
  description: "Writing and art by Leo Bruno",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Fixed Header — three-column: nav | logo | links */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 h-28">
          <div className="h-full flex items-center justify-between px-8">
            {/* Left: category nav */}
            <nav
              className="flex items-center gap-6 flex-shrink-0"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              <Link
                href="/"
                className="text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Essays
              </Link>
              <Link
                href="/"
                className="text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Field Guide
              </Link>
            </nav>

            {/* Center: logo */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <HeaderLogo />
            </div>

            {/* Right: site links */}
            <nav
              className="flex items-center gap-6 flex-shrink-0"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              <Link
                href="/poems"
                className="text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Poems
              </Link>
              <Link
                href="/newsletter"
                className="text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Newsletter
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-28">{children}</main>

        {/* Poem Slide-out Handler */}
        <PoemLinkHandler />

        {/* Audio Player */}
        <AudioPlayer />

        {/* Footer */}
        <Footer />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
