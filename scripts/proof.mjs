#!/usr/bin/env node
/**
 * PROOF — render the magazine to PDF and prove it printed as it appeared.
 *
 * The PDF is the artifact of record, so this is the test that matters. It:
 *   1. renders each piece's print route to PDF via headless Chrome (CDP),
 *   2. asserts every PDF page is exactly 8.5 x 11in — catches wrong paper,
 *      "shrink to fit", and a @page rule that drifted from the CSS tokens,
 *   3. asserts the page count equals the number of authored leaves — catches
 *      the phantom blank page a 1px overflow produces,
 *   4. refuses to emit a PDF when any frame is OVERSET.
 *
 * (4) is the whole point. A fixed page clips silently: without this check the
 * screen and the paper agree perfectly and are BOTH wrong, because the last
 * line of a column simply isn't there.
 *
 * No dependencies — Chrome over DevTools Protocol using Node's built-in
 * WebSocket. Usage:  node scripts/proof.mjs [baseUrl] [--png]
 */

import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const BASE = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3111"
const WANT_PNG = process.argv.includes("--png")
const OUT = path.join(process.cwd(), "out", "print")
const PORT = 9333

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function launch() {
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--user-data-dir=" + fs.mkdtempSync("/tmp/mag-chrome-"),
      "about:blank",
    ],
    { stdio: "ignore" }
  )
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (r.ok) return proc
    } catch {}
    await sleep(100)
  }
  proc.kill()
  throw new Error("Chrome did not expose a debugging port")
}

/** Minimal CDP client over the page target's WebSocket. */
async function connect() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
  const page = list.find((t) => t.type === "page")
  if (!page) throw new Error("no page target")
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true })
    ws.addEventListener("error", rej, { once: true })
  })
  let id = 0
  const pending = new Map()
  const events = []
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    } else if (msg.method) {
      events.push(msg)
    }
  })
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id
      pending.set(mid, { resolve, reject })
      ws.send(JSON.stringify({ id: mid, method, params }))
    })
  return { send, events, close: () => ws.close() }
}

/** Everything that must be settled before the layout is trustworthy. */
const READY = `(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const missing = ["Newsreader","Schnyder S","Graphik"]
    .filter(f => !document.fonts.check('12pt "' + f + '"'));

  // Bottom of the last rendered line in a frame. A Range is the only way to
  // get it: in a multi-column block the last line lives in the last column,
  // and no element box reports where it ends.
  const lastLineBottom = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last = null, n;
    while ((n = w.nextNode())) if (n.nodeValue.trim()) last = n;
    if (!last) return null;
    const r = document.createRange();
    r.selectNodeContents(last);
    const rects = r.getClientRects();
    if (!rects.length) return null;
    return rects[rects.length - 1].bottom;
  };

  const frames = [...document.querySelectorAll('.mag-frame[data-frame]')].map(el => {
    const box = el.getBoundingClientRect();
    // A fixed-height multi-column block overflows SIDEWAYS — it lays out extra
    // columns past the right edge — so a height-only check misses it entirely.
    const overV = el.scrollHeight - el.clientHeight;
    const overH = el.scrollWidth  - el.clientWidth;
    const by = Math.max(overV, overH);
    const bottom = lastLineBottom(el);
    const fill = bottom == null || box.height === 0
      ? null
      : Math.round(((bottom - box.top) / box.height) * 100);
    return {
      frame: el.dataset.frame,
      folio: el.closest('.mag-page')?.dataset.folioN,
      by, axis: overH > overV ? 'columns' : 'height', fill,
    };
  });

  return JSON.stringify({
    pages: document.querySelectorAll('.mag-page').length,
    missing,
    overset: frames.filter(f => f.by > 1),
    fill: frames,
  });
})()`

function pdfPageBoxes(buf) {
  const boxes = []
  const re = /\/MediaBox\s*\[([^\]]*)\]/g
  let m
  while ((m = re.exec(buf.toString("latin1")))) {
    const v = m[1].trim().split(/\s+/).map(Number)
    boxes.push({ w: (v[2] - v[0]) / 72, h: (v[3] - v[1]) / 72 })
  }
  return boxes
}

async function main() {
  const slugs = process.env.SLUGS
    ? process.env.SLUGS.split(",")
    : fs
        .readdirSync(path.join(process.cwd(), "content/magazine/pieces"))
        .filter((f) => f.endsWith(".tsx"))
        .map((f) => f.replace(/\.tsx$/, ""))

  fs.mkdirSync(OUT, { recursive: true })
  const chrome = await launch()
  const cdp = await connect()
  await cdp.send("Page.enable")
  await cdp.send("Runtime.enable")

  let failed = false
  for (const slug of slugs) {
    const url = `${BASE}/magazine/${slug}/print`
    process.stdout.write(`\n── ${slug}\n   ${url}\n`)
    await cdp.send("Page.navigate", { url })
    await sleep(1200)

    const { result } = await cdp.send("Runtime.evaluate", {
      expression: READY,
      awaitPromise: true,
      returnByValue: true,
    })
    const info = JSON.parse(result.value)

    if (info.missing.length) {
      console.error(`   ✗ FONTS NOT LOADED: ${info.missing.join(", ")}`)
      console.error("     A substituted face re-wraps a page that cannot reflow.")
      failed = true
    }

    // Fill report — see how close each column is running to its frame.
    for (const f of info.fill.sort((a, b) => (b.fill ?? 0) - (a.fill ?? 0))) {
      const pct = f.fill == null ? "  --" : `${String(f.fill).padStart(3)}%`
      const flag = f.by > 1 ? "✗" : (f.fill ?? 0) >= 97 ? "!" : " "
      const note = f.by > 1 ? `  OVERSET by ${f.by}px (${f.axis})` : ""
      process.stdout.write(
        `   ${flag} folio ${String(f.folio).padStart(2)}  ${f.frame.padEnd(10)} ${pct} full${note}\n`
      )
    }

    if (info.overset.length) {
      console.error("   ✗ OVERSET — refusing to render:")
      for (const o of info.overset) {
        console.error(`     folio ${o.folio}  frame "${o.frame}"  clipped by ${o.by}px (${o.axis})`)
      }
      failed = true
      continue
    }

    const { data } = await cdp.send("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true, // without this you silently get Letter-default pages
      scale: 1,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      displayHeaderFooter: false,
    })
    const buf = Buffer.from(data, "base64")
    const file = path.join(OUT, `${slug}.pdf`)
    fs.writeFileSync(file, buf)

    const boxes = pdfPageBoxes(buf)
    const bad = boxes.filter((b) => Math.abs(b.w - 8.5) > 0.01 || Math.abs(b.h - 11) > 0.01)
    if (bad.length) {
      console.error(`   ✗ PAGE SIZE: ${bad.length} page(s) are not 8.5 x 11in`)
      failed = true
    }
    if (boxes.length !== info.pages) {
      console.error(`   ✗ PAGE COUNT: ${boxes.length} PDF pages for ${info.pages} authored leaves`)
      failed = true
    }
    if (!bad.length && boxes.length === info.pages) {
      process.stdout.write(`   ✓ ${boxes.length} pages, all exactly 8.5 × 11in → ${path.relative(process.cwd(), file)}\n`)
    }

    if (WANT_PNG) {
      for (let n = 1; n <= info.pages; n++) {
        await cdp.send("Page.navigate", { url: `${url}?only=${n}` })
        await sleep(700)
        await cdp.send("Runtime.evaluate", { expression: READY, awaitPromise: true, returnByValue: true })
        const one = await cdp.send("Page.printToPDF", {
          printBackground: true, preferCSSPageSize: true, scale: 1,
          marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
          displayHeaderFooter: false,
        })
        fs.writeFileSync(path.join(OUT, `${slug}-p${String(n).padStart(2, "0")}.pdf`), Buffer.from(one.data, "base64"))
      }
      process.stdout.write(`   ✓ per-page proofs written\n`)
    }
  }

  cdp.close()
  chrome.kill()
  process.stdout.write(failed ? "\n✗ proof failed\n" : "\n✓ proof passed\n")
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
