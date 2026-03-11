import Link from "next/link"
import SearchHint from "@/components/SearchHint"

export default function Footer() {
  return (
    <footer className="py-8 bg-zinc-950 border-t border-[#3A2E24]">
      {/* Mobile: Centered stacked layout */}
      <div className="flex flex-col items-center gap-4 px-8 sm:hidden">
        <nav className="flex gap-6">
          <Link
            href="/essays"
            className="text-sm text-zinc-50 hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Essays
          </Link>
          <Link
            href="/fiction"
            className="text-sm text-zinc-50 hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Fiction
          </Link>
          <Link
            href="/poems"
            className="text-sm text-zinc-50 hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Poems
          </Link>
        </nav>

        <p
          className="text-xs"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
        >
          © {new Date().getFullYear()} Leo Bruno. All rights reserved.
        </p>
      </div>

      {/* Desktop: Side by side layout */}
      <div className="hidden sm:flex justify-between items-center px-8">
        <nav className="flex gap-6">
          <Link
            href="/essays"
            className="text-sm text-zinc-50 hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Essays
          </Link>
          <Link
            href="/fiction"
            className="text-sm text-zinc-50 hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Fiction
          </Link>
          <Link
            href="/poems"
            className="text-sm text-zinc-50 hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Poems
          </Link>
        </nav>

        <p
          className="text-xs"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
        >
          © {new Date().getFullYear()} Leo Bruno. All rights reserved.
        </p>
        <SearchHint />
      </div>
    </footer>
  )
}
