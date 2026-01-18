# Hero Images for Articles

Hero images are full-width background images that appear at the top of article pages, behind the navbar. They scroll with the page content and create a dramatic visual effect.

## How to Add a Hero Image

### 1. Add the image to the public folder

Place your image in the `/public` directory:

```
/public/your-image.jpg
```

### 2. Add the heroImage field to your markdown frontmatter

In your article's `.md` file (in the `/posts` folder), add the `heroImage` field:

```yaml
---
title: "Your Article Title"
date: "2026-01-11"
excerpt: "Your excerpt..."
teaser: "Your teaser"
heroImage: "/your-image.jpg"
---
```

**Important:** The path should start with `/` and be relative to the public folder.

## Example

For the literary modernism article (`posts/literary-modernisms.md`):

```yaml
---
title: "Battle over Literary Modernism"
titleShort: "Modernisms"
date: "2026-01-11"
excerpt: "Literary modernism was never singular..."
teaser: "Eliot versus Williams"
teaserShort: "Two modernisms"
heroImage: "/literary-modernism.jpg"
---
```

This will display the image at `/public/literary-modernism.jpg` as the hero image.

## How It Works

- **Full-width**: Hero image spans the entire viewport width
- **60vh height**: Image takes up 60% of the viewport height
- **Gradient overlay**: Dark gradient from transparent → semi-transparent → solid zinc-900
- **Scrolls with page**: Image is part of the document flow (not fixed)
- **Text positioning**: Article content starts after the hero image with proper padding
- **Behind navbar**: Uses z-index layering to ensure navbar stays on top

## Styling Details

The hero image container:

- Position: `absolute top-0 left-0`
- Size: `w-full h-[60vh]`
- Background: `cover center no-repeat`
- Overlay: Gradient from transparent to zinc-900

## Optional Field

The `heroImage` field is **optional**. If you don't include it:

- No hero image will display
- Normal article layout with standard padding applies
- Article looks like all other articles without hero images

## Best Practices

1. **Image dimensions**: Use high-resolution images (at least 1920px wide)
2. **File format**: JPG for photos, PNG for graphics with transparency
3. **File size**: Optimize images (aim for <500KB)
4. **Composition**: Ensure important visual elements are in the center/top
5. **Subject matter**: Choose images that complement the article content
6. **Text readability**: The gradient overlay helps, but avoid images with busy tops
