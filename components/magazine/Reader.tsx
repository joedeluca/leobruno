"use client"

import Link from "next/link"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { PAGE_PX } from "@/lib/magazine/geometry"

/**
 * The magazine reader.
 *
 * The page NEVER reflows. On a phone, on a desktop and in the PDF it is the
 * same fixed 8.5x11in artifact — only the scale applied to the whole sheet
 * changes, and the view shows one leaf instead of two. That is the whole point:
 * if the layout reflowed to a phone it would stop being the thing that prints,
 * and the printed proof would no longer prove anything.
 */
export default function Reader({
  pages,
  title,
  printHref,
}: {
  pages: React.ReactNode[]
  title: string
  printHref?: string
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [twoUp, setTwoUp] = useState(true)
  const [idx, setIdx] = useState(0)
  const [fit, setFit] = useState(1)
  const [scaleMul, setScaleMul] = useState(1)
  const [guides, setGuides] = useState(false)
  const [phone, setPhone] = useState(false)

  /** Spreads pair the way a real book does: folio 1 is a recto and stands
   *  alone, then verso/recto pairs — 2-3, 4-5, and so on. */
  const spreads = useMemo(() => {
    const out: number[][] = []
    if (pages.length === 0) return out
    out.push([0])
    for (let i = 1; i < pages.length; i += 2) {
      out.push(pages.slice(i, i + 2).map((_, j) => i + j))
    }
    return out
  }, [pages])

  const views = twoUp ? spreads : pages.map((_, i) => [i])
  const clampedIdx = Math.min(idx, Math.max(0, views.length - 1))
  const current = views[clampedIdx] ?? []

  const measure = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const wide = window.innerWidth >= 1024
    const phone = window.innerWidth < 700
    setTwoUp(wide)
    setPhone(phone)
    // clientWidth/Height INCLUDE padding, so read it rather than guessing —
    // guessing is how the leaf ends up a few px wider than the viewport and
    // the page gets a horizontal scrollbar.
    const cs = getComputedStyle(stage)
    const padX = Number.parseFloat(cs.paddingLeft) + Number.parseFloat(cs.paddingRight)
    const padY = Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom)
    const availW = stage.clientWidth - padX
    const availH = stage.clientHeight - padY
    const cols = wide ? 2 : 1
    const contentW = PAGE_PX.w * cols
    // On a phone, fit the WIDTH and let the leaf scroll. Fitting the whole
    // 11in page onto a 390px screen would render 9.5pt body copy at ~4pt.
    const next = phone
      ? availW / contentW
      : Math.min(availW / contentW, availH / PAGE_PX.h)
    setFit(next > 0 ? next : 1)
  }, [])

  useLayoutEffect(() => {
    measure()
    const stage = stageRef.current
    if (!stage) return
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    window.addEventListener("orientationchange", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("orientationchange", measure)
    }
  }, [measure])

  // Keep the view index meaningful when the layout flips between one-up and
  // two-up, so rotating a phone doesn't lose your place.
  useEffect(() => {
    setIdx((i) => Math.min(i, Math.max(0, (twoUp ? spreads.length : pages.length) - 1)))
  }, [twoUp, spreads.length, pages.length])

  const zoom = fit * scaleMul
  const go = useCallback(
    (d: number) => setIdx((i) => Math.max(0, Math.min(views.length - 1, i + d))),
    [views.length]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1)
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1)
      else if (e.key === "g") setGuides((g) => !g)
      else if (e.key === "0") setScaleMul(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  // Swipe between leaves on touch. Ignored while zoomed in, where the gesture
  // means panning instead.
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current || scaleMul !== 1) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
    touch.current = null
  }

  // Overset probe — InDesign's red plus. A fixed page clips silently, so
  // without this the screen and the paper agree perfectly and are both wrong.
  useEffect(() => {
    let raf = 0
    const scan = () => {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(".mag-frame[data-frame]"))) {
        const by = el.scrollHeight - el.clientHeight
        if (by > 1) {
          el.dataset.overset = "true"
          el.dataset.oversetBy = String(by)
        } else {
          delete el.dataset.overset
          delete el.dataset.oversetBy
        }
      }
    }
    // fonts.ready can resolve before the faces are actually applied, so take
    // one more frame before measuring.
    const run = () => {
      document.fonts.ready.then(() => {
        raf = requestAnimationFrame(scan)
      })
    }
    run()
    window.addEventListener("beforeprint", scan)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("beforeprint", scan)
    }
  }, [])

  useEffect(() => {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(".mag-page"))) {
      if (guides) el.dataset.guides = "true"
      else delete el.dataset.guides
    }
  }, [guides, clampedIdx])

  const wrapW = PAGE_PX.w * current.length * zoom
  const wrapH = PAGE_PX.h * zoom

  return (
    <div className="mag-root">
      <div className="mag-bar" data-noprint>
        <Link href="/">←{phone ? "" : " Leo Bruno"}</Link>
        <span className="mag-bar-title">{title}</span>
        <span className="mag-bar-spacer" />
        <button type="button" onClick={() => go(-1)} disabled={clampedIdx === 0}>
          ‹
        </button>
        <span>
          {current.length ? current.map((i) => i + 1).join("–") : "–"} / {pages.length}
        </span>
        <button type="button" onClick={() => go(1)} disabled={clampedIdx >= views.length - 1}>
          ›
        </button>
        <button
          type="button"
          data-bar="wide-only"
          onClick={() => setScaleMul((m) => Math.max(0.4, +(m - 0.2).toFixed(2)))}
        >
          −
        </button>
        <button type="button" data-bar="wide-only" onClick={() => setScaleMul(1)}>
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          data-bar="wide-only"
          onClick={() => setScaleMul((m) => Math.min(4, +(m + 0.2).toFixed(2)))}
        >
          +
        </button>
        <button type="button" data-bar="wide-only" onClick={() => setGuides((g) => !g)}>
          {guides ? "Guides on" : "Guides"}
        </button>
        {printHref ? (
          <Link href={printHref} data-bar="wide-only">
            Print / PDF
          </Link>
        ) : null}
      </div>

      <div
        className="mag-stage"
        ref={stageRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="mag-spreadwrap" style={{ width: wrapW, height: wrapH }}>
          <div className="mag-spread" style={{ "--zoom": zoom } as React.CSSProperties}>
            {current.map((i) => (
              <div key={i}>{pages[i]}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
