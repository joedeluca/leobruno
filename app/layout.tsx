import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import HeaderLogo from "@/components/HeaderLogo"
import PoemLinkHandler from "@/components/PoemLinkHandler"
import Footer from "@/components/Footer"
import AudioPlayer from "@/components/AudioPlayer"
import SearchOverlay from "@/components/SearchOverlay"
import MobileNav from "@/components/MobileNav"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import ImageLightbox from "@/components/ImageLightbox"

export const metadata: Metadata = {
  metadataBase: new URL("https://leobruno.it"),
  title: {
    default: "Leo Bruno — Writer",
    template: "%s — Leo Bruno",
  },
  description:
    "Leo Bruno is an American writer living in Sardinia, Italy. Literary fiction, cultural criticism, and essays. Published in Gradiva and I-70 Review.",
  openGraph: {
    siteName: "Leo Bruno",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png?v=2", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/dnx2cfm.css" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FJNC25MFK9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FJNC25MFK9');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Fixed Header — three-column: nav | logo | links */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md h-28" style={{ borderBottom: '1px solid #3A2E24' }}>
          <div className="h-full flex items-center justify-between px-8">
            {/* Left: spacer to balance hamburger */}
            <div className="w-8" />

            {/* Center: logo — invisible placeholder for layout balance */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-0">
              <HeaderLogo />
            </div>

            {/* Right: hamburger — all screen sizes */}
            <MobileNav />
          </div>
        </header>

        {/* Logo — fixed above overlay, outside header stacking context */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 h-28 flex items-center z-[105] pointer-events-auto">
          <HeaderLogo />
        </div>

        {/* Global Search Overlay */}
        <SearchOverlay />

        {/* Image Lightbox */}
        <ImageLightbox />

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
