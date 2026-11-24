import Link from "next/link"
import SearchHint from "@/components/SearchHint"

export default function Footer() {
  return (
    <footer className="py-8 bg-zinc-950 border-t border-[#3A2E24]">
      {/* Mobile: Centered stacked layout */}
      <div className="flex flex-col items-center gap-4 px-8 sm:hidden">
        {/* Section nav off for now.
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
        */}
        <Link
          href="/about"
          className="text-sm transition-colors"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
        >
          About Leo
        </Link>

        <p
          className="text-xs"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
        >
          © {new Date().getFullYear()} Leo Bruno. All rights reserved.
        </p>
      </div>

      {/* Desktop: Side by side layout */}
      <div className="hidden sm:flex justify-between items-center px-8">
        {/* Section nav off for now. The empty box keeps the copyright line centred.
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
        */}
        <div className="flex-1" />

        <p
          className="text-xs"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif', color: '#5a4a3a' }}
        >
          © {new Date().getFullYear()} Leo Bruno. All rights reserved.
        </p>
        <div className="flex-1 flex items-center justify-end gap-4">
          <Link
            href="/about"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif', fontSize: '11px', color: '#5a4a3a', letterSpacing: '0.1em' }}
          >
            About Leo
          </Link>
          <SearchHint />
        </div>
      </div>
    </footer>
  )
}
