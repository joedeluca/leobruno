# Hero Images - Advanced Options

In addition to the basic `heroImage` field, you can customize how the image displays using these optional fields.

## All Available Fields

```yaml
---
title: "Your Article Title"
heroImage: "/your-image.jpg"
heroImageSize: "contain" # Optional: cover (default), contain, auto
heroImagePosition: "center top" # Optional: any CSS position value
heroImageHeight: "50vh" # Optional: any CSS height value (default 60vh)
heroContentStart: "25vh" # Optional: where content starts (default: auto-calculated)
teaserFontSize: "clamp(0.875rem, 2vw, 1.5rem)" # Optional: teaser font size
titleFontSize: "clamp(2rem, 5vw, 4rem)" # Optional: title font size
---
```

## heroImageSize

Controls how the image fills the hero area.

### Options:

**`cover`** (default)

- Fills entire area
- May crop parts of the image
- Best for: landscape photos, full-bleed backgrounds

**`contain`**

- Shows the complete image
- May have empty space around it
- Best for: portraits, logos, images you want to see fully

**`auto`**

- Uses original image dimensions
- Best for: pixel-perfect control

### Example:

```yaml
# Full-bleed landscape
heroImageSize: "cover"

# Show complete portrait
heroImageSize: "contain"
```

## heroImagePosition

Controls where the image is positioned within the hero area.

### Common Values:

```yaml
heroImagePosition: "center"        # Center both axes (default)
heroImagePosition: "center top"    # Centered horizontally, aligned to top
heroImagePosition: "center bottom" # Centered horizontally, aligned to bottom
heroImagePosition: "left center"   # Aligned left, centered vertically
heroImagePosition: "right center"  # Aligned right, centered vertically
heroImagePosition: "left top"      # Top-left corner
heroImagePosition: "50% 25%"       # Custom: 50% from left, 25% from top
```

### Use Cases:

- `center top` - Portrait images where the subject's face should be visible
- `center bottom` - Images with important content at the bottom
- Custom percentages - Precise control for specific compositions

## heroImageHeight

Controls the height of the hero section.

### Common Values:

```yaml
heroImageHeight: "60vh"  # Default - 60% of viewport height
heroImageHeight: "50vh"  # Shorter, more subtle
heroImageHeight: "80vh"  # Taller, more dramatic
heroImageHeight: "100vh" # Full screen
heroImageHeight: "400px" # Fixed pixel height
```

### Guidelines:

- **50vh** - Subtle hero, good for smaller images
- **60vh** - Balanced, works for most images (default)
- **80vh** - Dramatic, use for striking images
- **100vh** - Full screen, very dramatic (content starts below fold)

## heroContentStart

Controls exactly where the article content begins relative to the top of the page.

### Why Use This?

By default, content starts at `heroImageHeight - 20vh` (to create overlap with the gradient). But sometimes you want precise control over where text begins, especially when:

- The focal point of your image needs specific spacing
- You want the title to appear at a very specific position
- The auto-calculation doesn't work for your image composition

### Common Values:

```yaml
heroContentStart: "25vh"   # Content starts 25% down the viewport
heroContentStart: "30vh"   # Content starts 30% down the viewport
heroContentStart: "15vh"   # Content starts higher up (15%)
heroContentStart: "300px"  # Fixed pixel height
```

### How It Works:

- **Without heroContentStart**: Content starts at `calc(heroImageHeight - 20vh)`
  - Example: 50vh image → content starts at 30vh
- **With heroContentStart**: Content starts exactly where you specify
  - Example: `heroContentStart: "25vh"` → content always starts at 25vh

### Example:

```yaml
---
title: "Battle over Literary Modernism"
heroImage: "/pound-venezia.webp"
heroImageSize: "cover"
heroImagePosition: "50% 25%"
heroImageHeight: "40vh"
heroContentStart: "25vh" # Content starts at 25vh (not auto-calculated 20vh)
---
```

This gives you pixel-perfect control over the text placement relative to your image composition.

## teaserFontSize & titleFontSize

Controls the font sizes for the teaser (h5) and title (h1) headlines. Uses fluid typography for responsive scaling.

### Default Values:

```yaml
teaserFontSize: "clamp(0.875rem, 2vw, 1.5rem)" # h5/teaser
titleFontSize: "clamp(2rem, 5vw, 4rem)" # h1/title
```

### How It Works:

Each uses CSS `clamp()` with three values:

1. **Minimum size** - Smallest the text will be on tiny screens
2. **Preferred size** - Scales with viewport width (vw)
3. **Maximum size** - Largest the text will be on huge screens

### Examples:

**Smaller Headlines:**

```yaml
teaserFontSize: "clamp(0.75rem, 1.5vw, 1rem)"
titleFontSize: "clamp(1.5rem, 3.5vw, 2.5rem)"
```

**Larger Headlines:**

```yaml
teaserFontSize: "clamp(1rem, 2.5vw, 2rem)"
titleFontSize: "clamp(2.5rem, 6vw, 5rem)"
```

**Fixed Sizes (no scaling):**

```yaml
teaserFontSize: "1.25rem" # 20px fixed
titleFontSize: "3rem" # 48px fixed
```

### Understanding the Numbers:

For `clamp(0.875rem, 2vw, 1.5rem)`:

- `0.875rem` = 14px minimum
- `2vw` = 2% of viewport width (fluid scaling)
- `1.5rem` = 24px maximum

The middle value (`2vw`) creates smooth responsive sizing—the text scales continuously with the browser width between min and max bounds.

### Use Cases:

**Short punchy titles:**

```yaml
titleFontSize: "clamp(2.5rem, 6vw, 5rem)" # Make them big and bold
```

**Long titles:**

```yaml
titleFontSize: "clamp(1.5rem, 4vw, 3rem)" # Keep them manageable
```

**Subtle teasers:**

```yaml
teaserFontSize: "clamp(0.75rem, 1.5vw, 1rem)" # Small and understated
```

**Prominent teasers:**

```yaml
teaserFontSize: "clamp(1rem, 2.5vw, 2rem)" # Larger, more visible
```

### Complete Example:

```yaml
---
title: "Battle over Literary Modernism"
teaser: "Eliot versus Williams"
heroImage: "/pound-venezia.webp"
heroImageSize: "cover"
heroImagePosition: "50% 25%"
heroImageHeight: "40vh"
heroContentStart: "35vh"
teaserFontSize: "clamp(1rem, 2vw, 1.5rem)"
titleFontSize: "clamp(2.5rem, 5.5vw, 4.5rem)"
---
```

This gives you precise control over headline sizing while maintaining responsive behavior across all screen sizes.

## Complete Examples

### Portrait Image (Like Ezra Pound)

```yaml
---
title: "Battle over Literary Modernism"
heroImage: "/ezra-pound.jpg"
heroImageSize: "contain"
heroImagePosition: "center top"
heroImageHeight: "50vh"
---
```

Result: Shows the complete portrait, positioned at top, moderate height.

### Landscape Photo

```yaml
---
title: "Mountain Journey"
heroImage: "/mountain-landscape.jpg"
heroImageSize: "cover"
heroImagePosition: "center"
heroImageHeight: "80vh"
---
```

Result: Full-bleed dramatic landscape that fills a large hero area.

### Logo or Graphic

```yaml
---
title: "Company History"
heroImage: "/company-logo.png"
heroImageSize: "contain"
heroImagePosition: "center"
heroImageHeight: "40vh"
---
```

Result: Centered logo with moderate height, showing complete graphic.

### Texture/Pattern Background

```yaml
---
title: "Design Essay"
heroImage: "/texture-pattern.jpg"
heroImageSize: "cover"
heroImagePosition: "center"
heroImageHeight: "60vh"
---
```

Result: Full-bleed texture background at standard height.

## How Padding Works

The content padding automatically adjusts based on your `heroImageHeight`:

```
content padding-top = heroImageHeight - 20vh
```

This ensures:

- Content starts after the hero image
- There's overlap with the gradient
- Text doesn't jump abruptly after the image

## Defaults

If you only specify `heroImage` and omit the other fields:

```yaml
heroImage: "/your-image.jpg"
# These are automatically applied:
# heroImageSize: "cover"
# heroImagePosition: "center"
# heroImageHeight: "60vh"
```

## Tips

1. **Test different sizes** - Try contain vs cover to see what works
2. **Adjust position for faces** - Use "center top" for portraits so faces aren't cut off
3. **Match height to image importance** - Dramatic images deserve taller heights
4. **Consider mobile** - vh units scale well across devices
5. **Use the gradient** - The overlay helps text readability, but test your image

## When to Use Each Size

### Use `cover` when:

- You want a full-bleed dramatic effect
- The image is landscape-oriented
- It's okay if edges are cropped
- You want the image to fill the entire space

### Use `contain` when:

- You want to see the entire image
- The image is portrait-oriented
- The composition shouldn't be cropped
- The image has important content at edges

### Use `auto` when:

- You want exact pixel-perfect display
- Working with graphics or diagrams
- You have very specific size requirements
