import type React from "react"

/**
 * A named block of prose, lifted out of the piece's markdown and dropped into
 * a frame. Prose stays in posts/*.md and stays editable as prose; the layout
 * stays in TSX and stays editable as code.
 *
 * There is deliberately NO story threading — a slot lands in exactly one
 * frame and does not flow on to the next. Automatic reflow is precisely what
 * stops a fixed page being fixed. If a column runs long, split the slot or cut
 * a line; the overset marker will tell you loudly that you must.
 */
export default function Copy({
  html,
  dropcap,
  align,
  style,
}: {
  html: string | undefined
  dropcap?: boolean
  align?: "justify" | "left"
  style?: React.CSSProperties
}) {
  return (
    <div
      className="mag-copy"
      data-dropcap={dropcap ? "true" : undefined}
      data-align={align === "left" ? "left" : undefined}
      style={style}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: first-party markdown, same pipeline as the rest of the site
      dangerouslySetInnerHTML={{ __html: html ?? "" }}
    />
  )
}
