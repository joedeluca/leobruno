import { visit } from "unist-util-visit"
import type { Root, Paragraph, Text } from "mdast"

/**
 * Remark plugin to add classes to screenplay formatting elements
 * - FADE IN:, FADE OUT:, CUT TO:, etc. get .screenplay-transition
 * - Scene headers (INT., EXT., lines with —) get .screenplay-scene-header
 */
export function remarkScreenplay() {
  return (tree: Root) => {
    visit(tree, "paragraph", (node: Paragraph, index, parent) => {
      // Get the text content of the paragraph
      const textNode = node.children[0]
      if (textNode?.type !== "text") return

      const text = (textNode as Text).value.trim()

      // Check if it's a screenplay element
      const isTransition =
        text === "FADE IN:" ||
        text === "FADE OUT:" ||
        text === "FADE TO BLACK." ||
        text === "FADE TO BLACK" ||
        text.startsWith("CUT TO:")

      const isSceneHeader =
        text.startsWith("INT.") || text.startsWith("EXT.") || text.includes("—")

      // Add data attribute that will become a class
      if (isTransition || isSceneHeader) {
        ;(node.data as any) = {
          ...(node.data || {}),
          hProperties: {
            className: isTransition
              ? "screenplay-transition"
              : "screenplay-scene-header",
          },
        }
      }
    })
  }
}
