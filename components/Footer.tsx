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
            className="text-sm transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
          >
            Essays
          </Link>
          <Link
            href="/fiction"
            className="text-sm transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
          >
            Fiction
          </Link>
          <Link
            href="/poems"
            className="text-sm transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
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
            className="text-sm transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
          >
            Essays
          </Link>
          <Link
            href="/fiction"
            className="text-sm transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
          >
            Fiction
          </Link>
          <Link
            href="/poems"
            className="text-sm transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
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
        <div className="flex items-center gap-4">
          <Link
            href="/marginalia"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', fontSize: '11px', color: '#5a4a3a', letterSpacing: '0.1em' }}
          >
            Marginalia
          </Link>
          <SearchHint />
        </div>
      </div>
    </footer>
  )
}
