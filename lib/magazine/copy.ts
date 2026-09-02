import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

/**
 * Copy for a magazine piece.
 *
 * Two ways to address prose, so the layout can be built against content that
 * has not been touched:
 *
 *  1. NAMED SLOTS — put `<!--@ name -->` markers in the markdown and everything
 *     until the next marker belongs to that slot. The markers are HTML
 *     comments; `lib/posts.ts` runs remark-html with `sanitize: false`, so they
 *     pass straight through and are invisible on the existing web route.
 *
 *  2. BLOCKS — with no markers at all, every top-level block (paragraph,
 *     heading, rule, quote) is addressable by index. Good for laying out an
 *     existing piece without editing it first.
 */

export interface PieceCopy {
  title: string
  meta: Record<string, unknown>
  /** slot name -> HTML, from `<!--@ name -->` markers */
  slots: Record<string, string>
  /** every top-level block, in order, as HTML */
  blocks: string[]
  /** join a run of blocks: blocks 0..2 inclusive */
  range: (from: number, to?: number) => string
  /** named slot if present, else empty string */
  slot: (name: string) => string
}

const MARKER = /^<!--@\s*([a-zA-Z0-9_-]+)\s*-->\s*$/

async function toHtml(md: string): Promise<string> {
  const out = await remark().use(html, { sanitize: false }).process(md.trim())
  return out.toString()
}

export async function getPieceCopy(relPath: string): Promise<PieceCopy> {
  const full = path.join(process.cwd(), relPath)
  const raw = fs.readFileSync(full, "utf8")
  const { data, content } = matter(raw)

  // --- named slots -------------------------------------------------------
  const slots: Record<string, string> = {}
  const lines = content.split("\n")
  let currentSlot: string | null = null
  let buf: string[] = []
  const flush = async () => {
    if (currentSlot && buf.join("").trim()) slots[currentSlot] = await toHtml(buf.join("\n"))
    buf = []
  }
  for (const line of lines) {
    const m = line.match(MARKER)
    if (m) {
      await flush()
      currentSlot = m[1]
    } else if (currentSlot) {
      buf.push(line)
    }
  }
  await flush()

  // --- blocks ------------------------------------------------------------
  // Strip markers first so block indices are the same whether or not the file
  // has been marked up.
  const stripped = lines.filter((l) => !MARKER.test(l)).join("\n")
  const chunks = stripped
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter(Boolean)
  const blocks = await Promise.all(chunks.map(toHtml))

  return {
    title: (data.title as string) ?? "",
    meta: data,
    slots,
    blocks,
    range: (from, to) => blocks.slice(from, (to ?? from) + 1).join("\n"),
    slot: (name) => slots[name] ?? "",
  }
}
