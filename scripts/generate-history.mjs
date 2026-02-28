/**
 * generate-history.mjs
 *
 * Prebuild script. For every .md file in posts/ and content/newsletter/,
 * extract the full git log and the file content at each commit.
 * Writes static JSON to public/history/<relative-path>.json.
 *
 * On Vercel, set VERCEL_GIT_FETCH_DEPTH=0 (or add `git fetch --unshallow`
 * to the build command) to ensure full history is available.
 */

import { execSync, spawnSync } from "child_process"
import { readdirSync, mkdirSync, writeFileSync, existsSync } from "fs"
import { join, dirname, relative } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const outBase = join(root, "public", "history")

// Try to unshallow if needed (Vercel shallow clones)
try {
  const isShallow = execSync("git rev-parse --is-shallow-repository", {
    cwd: root,
    stdio: ["pipe", "pipe", "pipe"],
  })
    .toString()
    .trim()
  if (isShallow === "true") {
    console.log("[history] Shallow repo detected — fetching full history…")
    execSync("git fetch --unshallow", { cwd: root, stdio: "inherit" })
  }
} catch {
  // Not a git repo or fetch failed — skip silently
}

function run(cmd, opts = {}) {
  const result = spawnSync("sh", ["-c", cmd], {
    cwd: root,
    encoding: "utf8",
    ...opts,
  })
  if (result.error) return ""
  return (result.stdout || "").trim()
}

/**
 * Collect .md files under a directory (non-recursive for now,
 * extend if you add subdirectories).
 */
function collectMdFiles(dir) {
  const abs = join(root, dir)
  if (!existsSync(abs)) return []
  return readdirSync(abs)
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(dir, f).replace(/\\/g, "/"))
}

const targets = [
  ...collectMdFiles("posts"),
  ...collectMdFiles("content/newsletter"),
]

console.log(`[history] Processing ${targets.length} file(s)…`)

for (const filePath of targets) {
  // e.g. "posts/the-open-sea.md" → "posts/the-open-sea"
  const key = filePath.replace(/\.md$/, "")
  const outPath = join(outBase, `${key}.json`)
  mkdirSync(dirname(outPath), { recursive: true })

  const logOutput = run(
    `git log --follow --format="%H|%ad|%s" --date=short -- "${filePath}"`
  )

  if (!logOutput) {
    console.log(`  [skip] ${filePath} — no git history`)
    writeFileSync(outPath, JSON.stringify({ filePath, commits: [] }), "utf8")
    continue
  }

  const lines = logOutput.split("\n").filter(Boolean)
  const commits = []

  for (const line of lines) {
    const pipeIdx = line.indexOf("|")
    const pipe2Idx = line.indexOf("|", pipeIdx + 1)
    if (pipeIdx === -1 || pipe2Idx === -1) continue

    const hash = line.slice(0, pipeIdx).trim()
    const date = line.slice(pipeIdx + 1, pipe2Idx).trim()
    const message = line.slice(pipe2Idx + 1).trim()

    const content = run(`git show "${hash}":"${filePath}"`)

    if (content) {
      commits.push({ hash: hash.slice(0, 8), date, message, content })
    }
  }

  console.log(`  ${filePath} — ${commits.length} commit(s)`)
  writeFileSync(
    outPath,
    JSON.stringify({ filePath, commits }, null, 0),
    "utf8"
  )
}

console.log("[history] Done.")
