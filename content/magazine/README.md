# The Magazine

Fixed, hand-laid pages. A piece is a list of leaves; each leaf is exactly
**8.5 × 11in** — the American magazine trim, the size Playboy ran at — on screen,
on a phone, and in the PDF. Nothing reflows. Ever.

The PDF is the artifact of record. Because the PDF page *is* the trim, art that
runs to the page edge is a true full bleed: no crop marks, nothing to cut.

---

## The grid

Everything is built on sixteenths so no column edge ever rounds:

```
trim            8.5 × 11in
margins         0.5in, all four edges
live (type) area 7.5 × 10in
columns         3 × 2.3125in, gutters of 0.3125in    (3×2.3125 + 2×0.3125 = 7.5 exactly)
column origins  x = 0.5in, 3.125in, 5.75in
baseline        12pt = 1/6in  →  exactly 60 lines per page
body            Newsreader 9.5pt / 12pt
```

`lib/magazine/geometry.ts` is the single source of truth. The CSS custom
properties in `app/magazine.css` mirror it, and `scripts/proof.mjs` asserts the
rendered PDF agrees.

## Laying out a piece

Prose stays in markdown. Layout is a TSX file in `content/magazine/pieces/`.
They are joined by `copyMap`.

```tsx
const piece: PieceSpec = {
  id: "friction-is-the-business",
  title: "Friction is the Business",
  kind: "piece",
  copySource: "copywriter/friction-is-the-business.md",
  runningHead: "Friction is the Business",

  // which block of prose lands in which frame — a layout decision, so it
  // lives with the layout
  copyMap: (c) => ({
    deck: c.blocks[0],
    body: `${c.range(2, 7)}\n${c.range(9, 12)}`,
    pull: c.blocks[8],
  }),

  sheets: [
    {
      render: (c) => (
        <>
          <Frame id="body" col={1} span={3} line={1} lines={30}>
            <Columns cols={3}>
              <Copy html={c.copy.body} dropcap />
            </Columns>
          </Frame>
          <AdSlot id="friction/p3-strip" unit="third-horizontal" col={1} line={41} />
        </>
      ),
    },
  ],
}
```

Add the file, add a line to `content/magazine/pieces/index.ts`. Done.

### Reading a `<Frame>`

`col={1} span={3} line={1} lines={30}` means: start at grid column 1, three
columns wide (7.5in), starting at baseline 1 of 60, 30 baselines tall (5in).

- `x` `y` `w` `h` (inches, as numbers) are the escape hatch for art that ignores
  the grid.
- `bleed` runs the frame to all four page edges.
- Give every frame holding flowing copy an `id` — it's the name the proof
  reports.

### Addressing prose

Two ways, and you can mix them:

1. **By block index** — `c.blocks[8]`, `c.range(2, 7)`. Every top-level block of
   the markdown, in order. Works on content you haven't touched.
2. **By name** — put `<!--@ pull -->` markers in the markdown and everything
   until the next marker becomes that slot. The markers are HTML comments and
   `remark-html` runs with `sanitize: false`, so they pass straight through and
   are invisible on the normal web route.

**There is no story threading.** A slot lands in exactly one frame and does not
flow to the next. Automatic reflow is precisely what stops a fixed page being
fixed. If a column runs long, split the slot or cut a line — the proof will tell
you, loudly, that you must.

## Page numbers

Real and sequential, assigned by `lib/magazine/issue.ts`. Never hand-written.

Folio 1 is a recto, so **odd folios are rectos, even folios are versos** — the
one parity rule in the system. The folio sits at the outer edge: bottom-left on
a verso, bottom-right on a recto.

`folioMode: "silent"` hides the printed number but the page **still consumes
one**, so a cover or a full-bleed ad can never let the numbering drift out of
step with the physical position.

## Ads

Sold by size and placement, the way magazines sold them. `lib/magazine/adUnits.ts`
carries the inventory — `full-page`, `two-thirds-vertical`, `half-horizontal`,
`half-vertical`, `half-island`, `third-vertical`, `third-square`,
`third-horizontal`, `quarter`, `sixth-vertical`, `sixth-horizontal`, `twelfth` —
each with its live dimensions on the same grid as the editorial, so an ad and a
column of body copy always share edges.

```tsx
<AdSlot id="friction/c4" unit="full-page" placement="cover-4" bleed />
<AdSlot id="friction/p4-column" unit="third-vertical" col={3} line={1} />
```

An `AdSlot` with no children draws its own spec — unit name, inches, pixel
dimensions at 300dpi, and its slot id — so the sellable inventory is visible on
the page while you design.

**The slot `id` is the identity a booking is sold against, and it is
deliberately not derived from the page number.** Re-laying-out a piece so page 7
becomes page 9 must not move or void a sold slot. The folio is derived metadata;
the hand-assigned key is canonical.

Placement classes: `cover-2`, `cover-3`, `cover-4`, `opposite-toc`,
`first-spread`, `far-forward`, `run-of-book`, `marketplace`.

Not built, by design: bookings, advertiser admin, creative upload, metrics.
Because every slot already carries its id, unit and placement, adding them later
never requires touching a layout.

## Proofing

```bash
npm run dev                              # then, in another shell:
node scripts/proof.mjs http://localhost:3000
node scripts/proof.mjs http://localhost:3000 --png   # + one PDF per leaf
```

No dependencies — it drives headless Chrome over DevTools Protocol with Node's
built-in WebSocket. It:

1. asserts every PDF page is exactly 8.5 × 11in — catches wrong paper size,
   "shrink to fit", and an `@page` rule that drifted from the CSS tokens;
2. asserts the page count equals the number of authored leaves — catches the
   phantom blank page a 1px overflow produces;
3. asserts the three faces actually loaded — a substituted face re-wraps a page
   that cannot reflow;
4. **refuses to emit a PDF if any frame is overset.**

(4) is the point. A fixed page clips silently: without it, the screen and the
paper agree perfectly and are *both* wrong, because the last line of a column
simply isn't there. Note that a fixed-height multi-column block overflows
*sideways* — it lays out extra columns past the right edge — so the check tests
both axes and tells you which one blew.

The fill report shows how close each frame is running:

```
  folio  1  deck        85% full
  folio  3  body        83% full
✗ folio  3  body        15% full  OVERSET by 252px (columns)
```

Anything at 97% or more is flagged: it will overset on the next copy edit.

Output lands in `out/print/`.

## Rules that are not style preferences

- **Inches and points inside a page. Never px, rem, vw/vh, and never a Tailwind
  responsive variant.** The page is a physical object. A `lg:` variant is
  meaningless on a fixed canvas and silently dies in print.
- **No `filter`, `mix-blend-mode`, `backdrop-filter` or `box-shadow` on anything
  containing text.** Chromium can't express them as PDF vector operations, so it
  flattens the whole subtree to a bitmap at roughly screen resolution and the
  text stops being selectable. Bake duotone and grain into 300dpi assets instead.
  The print stylesheet neutralises them so a stray utility class degrades to flat
  rather than to mush.
- **Art at ≥ 2550px on the long edge** for a full-page bleed (8.5in × 300dpi).
  Use `<Art>`, never `next/image` — it lazy-loads, so art on later pages never
  loads and prints as a blank frame, and its `sizes` heuristic serves a ~1080w
  variant that is about 100dpi on paper.
- **Print colours from the page tokens.** The site's hover amber `#F59E0B` is
  outside CMYK gamut and prints brown; `--accent` is an oxide red that isn't.
- **Rules no thinner than 0.4pt.** Below that they drop out on some drivers.

### Why the reset repeats its class three times

Tailwind v3's `@layer` is a Tailwind directive, **not** a native CSS cascade
layer — it's stripped at build time, and the compiled stylesheet contains zero
`@layer` at-rules. (Verified, not assumed.) So the usual "an unlayered author
rule beats a layered one" reasoning does not apply here; it is a plain
specificity fight, and `globals.css` fields selectors as strong as
`div > p:first-of-type` (0,1,2).

`.mag-page p` is only (0,1,1) and loses — which is exactly how the first
paragraph of every frame was coming out in globals.css's grey instead of the
page's ink. Repeating the class lifts the reset to (0,3,1), which outranks
anything `globals.css` can field without `!important`. The reset also carries
`:not([class*="mag-"])` so it doesn't swallow the magazine's own primitives —
without it, a (0,3,1) reset collapses a 100pt display headline to body size.

Keep both when editing.

## Reading

- **Desktop** (≥1024px): two-page spreads, fitted to the viewport. Folio 1 is a
  recto and stands alone, then verso/recto pairs — 2–3, 4–5 — the way a book
  actually opens.
- **Phone** (<700px): one leaf at a time, fitted to the **width** so the type
  stays readable; scroll down the leaf, swipe across to the next. Fitting a whole
  11in page onto a 390px screen would render 9.5pt body copy at about 4pt.
- The layout is identical in all three. Only the scale applied to the whole
  sheet changes. If it reflowed to a phone it would stop being the thing that
  prints, and the printed proof would prove nothing.

Keys: `←` `→` to turn, `g` for grid guides, `0` to reset zoom.

## Printing

`/magazine/<slug>/print` is the print target and the PDF source. It puts every
leaf in the DOM in folio order with no reader chrome — the reader only mounts the
spread you're looking at, so printing from it would print one spread.

`?only=3` renders a single leaf.

Printing from the browser dialog works, but five settings there are unreachable
from CSS (Margins, Scale, Background graphics, Headers/footers, and the driver's
own auto-fit). `scripts/proof.mjs` is deterministic; the browser dialog is a
convenience. **The PDF is the artifact of record.**
