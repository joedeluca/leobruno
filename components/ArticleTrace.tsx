"use client"

import { useState, useRef, useEffect } from "react"
import { diffLines } from "diff"

interface Commit {
  hash: string
  date: string
  message: string
  content: string
}

interface History {
  filePath: string
  commits: Commit[]
}

function DiffView({
  oldContent,
  newContent,
}: {
  oldContent: string
  newContent: string
}) {
  const changes = diffLines(oldContent, newContent)

  return (
    <div
      className="mt-6 text-xs leading-relaxed overflow-x-auto"
      style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
    >
      <div className="space-y-0">
        {changes.map((change, i) => {
          const lines = change.value.replace(/\n$/, "").split("\n")
          return lines.map((line, j) => {
            if (change.added) {
              return (
                <div
                  key={`${i}-${j}`}
                  className="px-3 py-[1px] bg-zinc-800/70 text-zinc-200"
                >
                  <span className="text-zinc-500 select-none mr-3">+</span>
                  {line || <span className="opacity-0">·</span>}
                </div>
              )
            }
            if (change.removed) {
              return (
                <div
                  key={`${i}-${j}`}
                  className="px-3 py-[1px] text-zinc-700 line-through"
                >
                  <span className="select-none mr-3">−</span>
                  {line || <span className="opacity-0">·</span>}
                </div>
              )
            }
            // unchanged — only show a few lines of context around changes
            if (lines.length > 6 && j > 2 && j < lines.length - 3) {
              if (j === 3) {
                return (
                  <div key={`${i}-${j}`} className="px-3 py-1 text-zinc-800 select-none">
                    ···
                  </div>
                )
              }
              return null
            }
            return (
              <div key={`${i}-${j}`} className="px-3 py-[1px] text-zinc-700">
                <span className="select-none mr-3 opacity-0">·</span>
                {line}
              </div>
            )
          })
        })}
      </div>
    </div>
  )
}

function CommitDot({
  commit,
  isActive,
  isLatest,
  onClick,
}: {
  commit: Commit
  isActive: boolean
  isLatest: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center gap-1"
      title={`${commit.date} — ${commit.message}`}
    >
      {/* Tooltip */}
      <div
        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap
          bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-400 text-[10px] tracking-wide
          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        <span className="text-zinc-600">{commit.date}</span>
        <span className="mx-1 text-zinc-800">—</span>
        {commit.message}
      </div>

      {/* Dot */}
      <div
        className={`w-2 h-2 rounded-full transition-colors ${
          isActive
            ? "bg-tiepolo-pink-600"
            : isLatest
            ? "bg-zinc-400"
            : "bg-zinc-700 group-hover:bg-zinc-500"
        }`}
      />

      {/* Date label */}
      <span
        className="text-[9px] text-zinc-700 group-hover:text-zinc-500 transition-colors"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        {commit.date.slice(5)} {/* MM-DD */}
      </span>
    </button>
  )
}

export function TraceButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-zinc-700 hover:text-zinc-500 transition-colors"
      style={{
        fontFamily: '"Graphik", system-ui, sans-serif',
        fontSize: "0.6rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {isOpen ? "Close" : "Trace"}
    </button>
  )
}

export default function ArticleTrace({
  filePath,
  currentContent,
  isOpen,
  onToggle,
}: {
  filePath: string
  currentContent: string
  isOpen: boolean
  onToggle: () => void
}) {
  const [history, setHistory] = useState<History | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeHash, setActiveHash] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Load data when first opened
  useEffect(() => {
    if (!isOpen || history) return
    setLoading(true)
    fetch(`/history/${filePath}.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: History | null) => { if (data) setHistory(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, filePath, history])

  // Reset active hash when closed
  useEffect(() => {
    if (!isOpen) setActiveHash(null)
  }, [isOpen])

  // Scroll panel into view when first opened
  useEffect(() => {
    if (isOpen && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 80)
    }
  }, [isOpen])

  const commits = history?.commits ?? []
  const activeCommit = commits.find((c) => c.hash === activeHash) ?? null

  return (
    <>
      {isOpen && (
        <div
          ref={panelRef}
          className="mt-16 pt-8 border-t border-zinc-800/60"
        >
          {loading && (
            <p
              className="text-zinc-700 text-xs tracking-widest uppercase"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              Loading…
            </p>
          )}

          {!loading && commits.length === 0 && (
            <p
              className="text-zinc-700 text-xs tracking-widest uppercase"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              No history available.
            </p>
          )}

          {!loading && commits.length > 0 && (
            <>
              {/* Label */}
              <p
                className="text-zinc-700 text-[10px] tracking-widest uppercase mb-6"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                {commits.length} revision{commits.length !== 1 ? "s" : ""}
                {activeCommit && (
                  <button
                    type="button"
                    onClick={() => setActiveHash(null)}
                    className="ml-4 text-tiepolo-pink-700 hover:text-tiepolo-pink-500 transition-colors"
                  >
                    ← read
                  </button>
                )}
              </p>

              {/* Timeline */}
              <div className="flex items-end gap-4 overflow-x-auto pb-4">
                {/* Line connecting dots */}
                <div className="flex items-center gap-4">
                  {commits.map((commit, i) => (
                    <div key={commit.hash} className="flex items-center">
                      <CommitDot
                        commit={commit}
                        isActive={commit.hash === activeHash}
                        isLatest={i === 0}
                        onClick={() =>
                          setActiveHash(
                            activeHash === commit.hash ? null : commit.hash
                          )
                        }
                      />
                      {i < commits.length - 1 && (
                        <div className="w-6 h-px bg-zinc-800 mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Diff view */}
              {activeCommit && (
                <div className="mt-4">
                  <div
                    className="text-[10px] text-zinc-600 mb-3 tracking-wide"
                    style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                  >
                    <span className="text-zinc-500">{activeCommit.date}</span>
                    <span className="mx-2 text-zinc-800">—</span>
                    <span className="text-zinc-500">{activeCommit.message}</span>
                    <span className="mx-2 text-zinc-800">—</span>
                    <span className="text-zinc-800">{activeCommit.hash}</span>
                  </div>
                  <DiffView
                    oldContent={activeCommit.content}
                    newContent={currentContent}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
