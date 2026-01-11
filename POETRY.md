# Poetry System

## Overview

The site now has a complete poetry system with individual poem pages and an index.

## Structure

### Poem Files

- Location: `/poems/*.md`
- Format: Markdown with YAML frontmatter

### Frontmatter Fields

```yaml
---
title: "Poem Title"
author: "Author Name"
date: "1923" # Publication year
collection: "Collection Name" # Optional
epigraph: | # Optional, multiline
  Quote text here
  —Source
---
```

### Routes

- `/poems` - Index page listing all poems grouped by author
- `/poems/[slug]` - Individual poem page

### API Endpoints

- `/api/poems` - Returns all poems
- `/api/poem/[slug]` - Returns single poem by slug

## Adding New Poems

1. Create a new markdown file in `/poems/` directory
2. Use kebab-case for filename (e.g., `the-waste-land.md`)
3. Add YAML frontmatter with required fields
4. Add poem content below frontmatter

Example:

```markdown
---
title: "The Waste Land"
author: "T.S. Eliot"
date: "1922"
collection: "The Waste Land and Other Poems"
---

April is the cruellest month, breeding
Lilacs out of the dead land, mixing
Memory and desire, stirring
Dull roots with spring rain.
```

## Features

- **Line Numbers**: Toggle on/off per poem
- **Audio Player**: Automatically looks for audio file at `/audio/poems/{title-slug}-by-{author-slug}.m4a`
- **Epigraphs**: Support for introductory quotes (not line-numbered)
- **Grouping**: Index page groups poems by author
- **Navigation**: Click poem links in articles to go to dedicated poem page

## Linking to Poems

In article markdown files, use:

```html
<span class="poem-link" data-poem-id="the-red-wheelbarrow"
  >The Red Wheelbarrow</span
>
```

The `data-poem-id` should match the poem's filename (without .md extension).
