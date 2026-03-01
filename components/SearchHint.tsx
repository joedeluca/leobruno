"use client"

export default function SearchHint() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("openSearch"))}
      className="text-left"
      style={{ fontFamily: '"Graphik", system-ui, sans-serif', fontSize: '11px', color: '#5a4a3a', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      ⌘K to search
    </button>
  )
}
