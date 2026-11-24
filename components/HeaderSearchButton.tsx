"use client"

export default function HeaderSearchButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("openSearch"))}
      className="flex items-center justify-center w-8 h-8 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-300"
      style={{ color: "#E8DCC8" }}
      aria-label="Search"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1" />
        <line x1="13" y1="13" x2="18" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </button>
  )
}
