export default function Footer() {
  return (
    <footer className="py-8 bg-zinc-950 border-t border-zinc-800">
      <div className="flex justify-center px-8">
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
