import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "You're in — Leo Bruno",
  description: "You're subscribed to the Leo Bruno newsletter.",
}

export default function WelcomePage() {
  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="lg:w-3/4 w-full px-8 pb-12 pt-[.8rem] lg:pr-8 lg:border-r lg:border-zinc-800">
        <div className="max-w-xl pt-12">
          <p
            className="text-xs uppercase tracking-wider text-zinc-500 mb-8"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Newsletter
          </p>

          <h1
            className="text-3xl text-zinc-100 mb-6 leading-tight"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            You're in.
          </h1>

          <p
            className="text-zinc-400 text-base leading-relaxed mb-4"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            The newsletter goes out when there's something worth saying. No
            schedule. No filler.
          </p>

          <p
            className="text-zinc-400 text-base leading-relaxed mb-12"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            In the meantime — there's writing here.
          </p>

          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors border-b border-zinc-800 hover:border-zinc-600 pb-px"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            ← Back to the site
          </Link>
        </div>
      </div>
      <div className="lg:w-1/4 hidden lg:block" />
    </div>
  )
}
