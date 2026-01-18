import type { Metadata } from "next"
import "./globals.css"
import HeaderSearchWrapper from "@/components/HeaderSearchWrapper"
import HeaderLogo from "@/components/HeaderLogo"
import PoemLinkHandler from "@/components/PoemLinkHandler"
import Footer from "@/components/Footer"

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
        {/* Fixed Header with search bar on right */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 h-20">
          <div className="h-full flex items-center">
            <div className="px-8 flex-shrink-0">
              <HeaderLogo />
            </div>
            <div className="flex-1 h-full border-l border-zinc-800">
              <HeaderSearchWrapper />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-20">{children}</main>

        {/* Poem Slide-out Handler */}
        <PoemLinkHandler />

        {/* Footer */}
        <Footer />
      </body>
    </html>
  )
}
