import type { Metadata } from "next"
import "./globals.css"
import HeaderSearchWrapper from "@/components/HeaderSearchWrapper"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Leo Bruno - Writer & Painter",
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
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800 h-20">
          <div className="h-full flex items-center">
            <div className="px-8 flex-shrink-0">
              <Link href="/">
                <h1 className="!text-[30px] text-tiepolo-pink-600 hover:text-tiepolo-pink-700 transition-colors cursor-pointer">
                  Leo Bruno
                </h1>
              </Link>
            </div>
            <div className="flex-1 h-full border-l border-zinc-800">
              <HeaderSearchWrapper />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-20">{children}</main>

        {/* Footer */}
        <footer className="py-8 bg-zinc-950 border-t border-zinc-800">
          <div className="flex justify-center px-8">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Leo Bruno. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
