import {
  AdSlot,
  Byline,
  Columns,
  Copy,
  Deck,
  Frame,
  Head,
  Kicker,
  PullQuote,
  Rule,
  Subhead,
} from "@/components/magazine"
import type { PieceSpec } from "@/lib/magazine/types"

/**
 * FRICTION IS THE BUSINESS — six leaves.
 *
 * Layout lives here; the prose stays in copywriter/friction-is-the-business.md
 * and is addressed by block index, so the source markdown is untouched. Add
 * `<!--@ name -->` markers to that file when you want named slots instead.
 *
 * Frame coordinates read as: col 1, three columns wide, starting at baseline 1
 * of 60, 26 baselines tall. `npm run mag:proof` reports how full each frame is
 * running and refuses to build a PDF if one overflows.
 */

/** The back-of-book marketplace: four rows of three 1/12-page units. */
const MARKETPLACE_ROWS = [7, 21, 34, 47]

const piece: PieceSpec = {
  id: "friction-is-the-business",
  title: "Friction is the Business",
  kind: "piece",
  copySource: "copywriter/friction-is-the-business.md",
  runningHead: "Friction is the Business",
  copyMap: (c) => ({
    deck: c.blocks[0], // the standfirst
    body: `${c.range(2, 7)}\n${c.range(9, 12)}`, // the argument, quote lifted out
    pull: c.blocks[8], // the blockquote, set as display
    notes: c.range(15, 18), // Craft Notes
  }),
  sheets: [
    /* ── 1 · OPENER (recto) ─────────────────────────────────────────────
       Type-only opener on a dark ground. Folio silent, the way an opener
       usually ran. */
    {
      ground: "dark",
      folioMode: "silent",
      render: (c) => (
        <>
          <Frame col={1} span={3} line={6} lines={3}>
            <Kicker>Brand Essay · Playmoove</Kicker>
          </Frame>
          {/* 3 lines at 92pt leading = 276pt = 23 baselines */}
          <Frame col={1} span={3} line={10} lines={24}>
            <Head size="xl">
              Friction
              <br />
              is the
              <br />
              Business
            </Head>
          </Frame>
          <Frame col={1} span={3} line={36} lines={1}>
            <Rule weight={1} />
          </Frame>
          <Frame id="deck" col={1} span={2} line={39} lines={12}>
            <Deck>
              <Copy html={c.copy.deck} align="left" />
            </Deck>
          </Frame>
          <Frame col={3} span={1} line={39} lines={3}>
            <Byline>By Leo Bruno</Byline>
          </Frame>
        </>
      ),
    },

    /* ── 2 · FULL-BLEED AD (verso) ──────────────────────────────────────
       A bespoke house ad running to all four page edges. Because the PDF page
       is the trim, this is a true bleed — nothing to cut. */
    {
      ground: "dark",
      folioMode: "silent",
      render: () => (
        <AdSlot id="friction/opener-facing" unit="full-page" placement="first-spread" bleed>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#100D0A",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "1in 0.9in",
              color: "#EFE8DC",
            }}
          >
            <div className="mag-kicker" style={{ color: "#C08A3A" }}>
              Now in print
            </div>
            <div>
              <div className="mag-head" data-size="l" style={{ color: "#EFE8DC", lineHeight: "62pt" }}>
                The Wolf
                <br />
                &amp; Other
                <br />
                Stories
              </div>
              <hr className="mag-rule" style={{ borderTopColor: "#4A3E30", margin: "22pt 0 14pt" }} />
              <div className="mag-deck" style={{ color: "#BCB2A4", maxWidth: "4.4in" }}>
                Thirteen stories from Arezzo, Cagliari and the long road between them.
                Mulberries and smoke.
              </div>
            </div>
            <div className="mag-credit" style={{ color: "#8B7F6E" }}>
              Leo Bruno · leobruno.it
            </div>
          </div>
        </AdSlot>
      ),
    },

    /* ── 3 · THE ESSAY (recto) ──────────────────────────────────────────
       The whole argument in three columns, a display pull quote below the
       fold, and a 1/3-page horizontal strip at the foot. */
    {
      render: (c) => (
        <>
          {/* 83% full at 30 baselines — headroom for a copy edit before it oversets */}
          <Frame id="body" col={1} span={3} line={1} lines={30}>
            <Columns cols={3}>
              <Copy html={c.copy.body} dropcap />
            </Columns>
          </Frame>
          <Frame col={1} span={3} line={32} lines={1}>
            <Rule />
          </Frame>
          <Frame id="pull" col={1} span={3} line={35} lines={8}>
            <PullQuote attribution="Friction is the Business">
              <Copy html={c.copy.pull} align="left" />
            </PullQuote>
          </Frame>
          {/* 3.25in tall; line 41 puts its foot at 10.417in, inside the live area */}
          <AdSlot id="friction/p3-strip" unit="third-horizontal" col={1} line={41} />
        </>
      ),
    },

    /* ── 4 · CRAFT NOTES + COLUMN AD (verso) ────────────────────────────
       Two columns of notes with a 1/3 vertical running the full height of
       column three — the classic department page. */
    {
      render: (c) => (
        <>
          <Frame col={1} span={2} line={1} lines={3}>
            <Subhead>Craft Notes</Subhead>
          </Frame>
          <Frame col={1} span={2} line={4} lines={1}>
            <Rule />
          </Frame>
          <Frame id="notes" col={1} span={2} line={6} lines={34}>
            <Columns cols={2}>
              <Copy html={c.copy.notes} />
            </Columns>
          </Frame>
          <AdSlot id="friction/p4-column" unit="third-vertical" col={3} line={1} />
        </>
      ),
    },

    /* ── 5 · MARKETPLACE (recto) ────────────────────────────────────────
       The back of the book: twelve 1/12-page units on the same grid as the
       editorial. Left empty so the sellable inventory is visible. */
    {
      render: () => (
        <>
          <Frame col={1} span={3} line={1} lines={3}>
            <Subhead>Marketplace</Subhead>
          </Frame>
          <Frame col={1} span={3} line={4} lines={1}>
            <Rule />
          </Frame>
          {MARKETPLACE_ROWS.flatMap((line, row) =>
            [1, 2, 3].map((col) => (
              <AdSlot
                key={`m-${row}-${col}`}
                id={`friction/mkt-${row + 1}${col}`}
                unit="twelfth"
                placement="marketplace"
                col={col}
                line={line}
              />
            ))
          )}
        </>
      ),
    },

    /* ── 6 · BACK COVER (verso) ─────────────────────────────────────────
       Cover 4 — the most expensive position in the book. */
    {
      folioMode: "silent",
      render: () => <AdSlot id="friction/c4" unit="full-page" placement="cover-4" bleed />,
    },
  ],
}

export default piece
