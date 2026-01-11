import Link from "next/link"

export default function Footer() {
  return (
    <footer className="py-8 bg-zinc-950 border-t border-zinc-800">
      <div className="flex justify-between items-center px-8">
        <nav className="flex gap-6">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Article Index
          </Link>
          <Link
            href="/poems"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Poems
          </Link>
        </nav>

        <p
          className="text-sm text-zinc-500"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          © {new Date().getFullYear()} leobruno. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
