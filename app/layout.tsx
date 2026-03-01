import type { Metadata } from "next"
import "./globals.css"
import HeaderLogo from "@/components/HeaderLogo"
import PoemLinkHandler from "@/components/PoemLinkHandler"
import Footer from "@/components/Footer"
import AudioPlayer from "@/components/AudioPlayer"
import SearchOverlay from "@/components/SearchOverlay"
import MobileNav from "@/components/MobileNav"
import Link from "next/link"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "Leo Bruno",
  description: "Writing and art by Leo Bruno",
  icons: {
    icon: "/favicon.png?v=2",
  },
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
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md h-28" style={{ borderBottom: '1px solid #3A2E24' }}>
          <div className="h-full flex items-center justify-between px-8">
            {/* Left: category nav — desktop only */}
            <nav
              className="hidden sm:flex items-center gap-6 flex-shrink-0"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              <Link
                href="/"
                className="text-xs uppercase tracking-widest transition-colors hover:text-zinc-100"
                style={{ color: '#E8DCC8', opacity: 0.7 }}
              >
                Essays
              </Link>
              <Link
                href="/"
                className="text-xs uppercase tracking-widest transition-colors hover:text-zinc-100"
                style={{ color: '#E8DCC8', opacity: 0.7 }}
              >
                Field Guide
              </Link>
            </nav>

            {/* Mobile: hamburger — left side placeholder to balance logo */}
            <div className="sm:hidden w-8" />

            {/* Center: logo — invisible placeholder for layout balance */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-0">
              <HeaderLogo />
            </div>

            {/* Right: site links — desktop only */}
            <nav
              className="hidden sm:flex items-center gap-6 flex-shrink-0"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              <Link
                href="/poems"
                className="text-xs uppercase tracking-widest transition-colors hover:text-zinc-100"
                style={{ color: '#E8DCC8', opacity: 0.7 }}
              >
                Poems
              </Link>
              <Link
                href="/newsletter"
                className="text-xs uppercase tracking-widest transition-colors hover:text-zinc-100"
                style={{ color: '#E8DCC8', opacity: 0.7 }}
              >
                Newsletter
              </Link>
            </nav>

            {/* Mobile: hamburger — right side */}
            <div className="sm:hidden">
              <MobileNav />
            </div>
          </div>
        </header>

        {/* Logo — fixed above overlay, outside header stacking context */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 h-28 flex items-center z-[105] pointer-events-auto">
          <HeaderLogo />
        </div>

        {/* Global Search Overlay */}
        <SearchOverlay />

        {/* Main Content */}
        <main className="flex-1 pt-28">{children}</main>

        {/* Poem Slide-out Handler */}
        <PoemLinkHandler />

        {/* Audio Player — disabled for now */}
        {/* <AudioPlayer /> */}

        {/* Footer */}
        <Footer />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
