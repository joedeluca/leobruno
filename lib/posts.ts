import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import { remarkScreenplay } from "./remarkScreenplay"

export interface Post {
  slug: string
  title: string
  titleShort?: string
  date: string
  excerpt: string
  category: string
  tags?: string[] // New: array of tags
  content?: string
  readTime?: string
  matchSnippet?: string
  teaser?: string
  teaserShort?: string
  heroImage?: string
  heroImageSize?: "cover" | "contain" | "auto"
  heroImagePosition?: string
  heroImageHeight?: string
  heroContentStart?: string
  teaserFontSize?: string
  titleFontSize?: string
  rawContent?: string
  verdict?: string
  person?: string
  stickerImage?: string
  ogImage?: string
}

const postsDirectory = path.join(process.cwd(), "posts")

export function getSortedPostsData(): Post[] {
  const allPosts: Post[] = []

  // Get blog posts
  if (fs.existsSync(postsDirectory)) {
    const fileNames = fs.readdirSync(postsDirectory)
    const blogPosts = fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, "")
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const matterResult = matter(fileContents)

        // Calculate read time (rough estimate)
        const words = matterResult.content.split(/\s+/).length
        const readTime = Math.ceil(words / 200)

        return {
          slug,
          title: matterResult.data.title,
          titleShort: matterResult.data.titleShort || matterResult.data.title,
          date: matterResult.data.date,
          excerpt: matterResult.data.excerpt || "",
          category: matterResult.data.category || "Essays",
          tags: matterResult.data.tags || [],
          readTime: `${readTime} min read`,
          teaser: matterResult.data.teaser || "",
          teaserShort:
            matterResult.data.teaserShort || matterResult.data.teaser || "",
          heroImage: matterResult.data.heroImage || "",
          heroImageSize: matterResult.data.heroImageSize || "cover",
          heroImagePosition: matterResult.data.heroImagePosition || "center",
          heroImageHeight: matterResult.data.heroImageHeight || "96vh",
          heroContentStart: matterResult.data.heroContentStart || "",
          teaserFontSize:
            matterResult.data.teaserFontSize || "clamp(0.875rem, 2vw, 1.5rem)",
          titleFontSize:
            matterResult.data.titleFontSize || "clamp(2rem, 5vw, 4rem)",
        }
      })
    allPosts.push(...blogPosts)
  }

  return allPosts.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getSortedPostsDataWithContent(): Post[] {
  const allPosts: Post[] = []

  // Get blog posts with content
  if (fs.existsSync(postsDirectory)) {
    const fileNames = fs.readdirSync(postsDirectory)
    const blogPosts = fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, "")
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const matterResult = matter(fileContents)

        // Calculate read time (rough estimate)
        const words = matterResult.content.split(/\s+/).length
        const readTime = Math.ceil(words / 200)

        return {
          slug,
          title: matterResult.data.title,
          titleShort: matterResult.data.titleShort || matterResult.data.title,
          date: matterResult.data.date,
          excerpt: matterResult.data.excerpt || "",
          category: matterResult.data.category || "Essays",
          tags: matterResult.data.tags || [],
          content: matterResult.content, // Include raw markdown content
          readTime: `${readTime} min read`,
          teaser: matterResult.data.teaser || "",
          teaserShort:
            matterResult.data.teaserShort || matterResult.data.teaser || "",
          heroImage: matterResult.data.heroImage || "",
          heroImageSize: matterResult.data.heroImageSize || "cover",
          heroImagePosition: matterResult.data.heroImagePosition || "center",
          heroImageHeight: matterResult.data.heroImageHeight || "60vh",
          heroContentStart: matterResult.data.heroContentStart || "",
          teaserFontSize:
            matterResult.data.teaserFontSize || "clamp(0.875rem, 2vw, 1.5rem)",
          titleFontSize:
            matterResult.data.titleFontSize || "clamp(2rem, 5vw, 4rem)",
          verdict: matterResult.data.verdict || "",
          person: matterResult.data.person || "",
          stickerImage: matterResult.data.stickerImage || "/sweetie-sticker.svg",
        }
      })
    allPosts.push(...blogPosts)
  }

  return allPosts.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllCategories(): string[] {
  const posts = getSortedPostsData()
  const categories = posts.map((post) => post.category)
  return Array.from(new Set(categories))
}

export async function getPostData(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const matterResult = matter(fileContents)

  const processedContent = await remark()
    .use(remarkScreenplay)
    .use(html, { sanitize: false })
    .process(matterResult.content)
  const contentHtml = processedContent
    .toString()
    .replace(
      /<hr\s*\/?>/gi,
      `<div class="ornament-divider"><span class="ornament-glyph">❧</span><span class="ornament-glyph ornament-glyph-mid">✦</span><span class="ornament-glyph ornament-glyph-flip">❧</span></div>`
    )

  // Calculate read time
  const words = matterResult.content.split(/\s+/).length
  const readTime = Math.ceil(words / 200)

  return {
    slug,
    title: matterResult.data.title,
    date: matterResult.data.date,
    excerpt: matterResult.data.excerpt || "",
    category: matterResult.data.category || "Essays",
    tags: matterResult.data.tags || [],
    content: contentHtml,
    rawContent: matterResult.content,
    readTime: `${readTime} min read`,
    verdict: matterResult.data.verdict || "",
    person: matterResult.data.person || "",
    stickerImage: matterResult.data.stickerImage || "/sweetie-sticker.svg",
    teaser: matterResult.data.teaser || "",
    teaserShort: matterResult.data.teaserShort || matterResult.data.teaser || "",
    heroImage: matterResult.data.heroImage || "",
    heroImageSize: matterResult.data.heroImageSize || "cover",
    heroImagePosition: matterResult.data.heroImagePosition || "center",
    heroImageHeight: matterResult.data.heroImageHeight || "96vh",
    heroContentStart: matterResult.data.heroContentStart || "",
    teaserFontSize:
      matterResult.data.teaserFontSize || "clamp(0.875rem, 2vw, 1.5rem)",
    titleFontSize: matterResult.data.titleFontSize || "clamp(2rem, 5vw, 4rem)",
    ogImage: matterResult.data.ogImage || "",
  }
}

export function getAllPostSlugs() {
  const allSlugs: { slug: string }[] = []

  // Get blog post slugs only (fragments handled by /fragments/[slug] route)
  if (fs.existsSync(postsDirectory)) {
    const fileNames = fs.readdirSync(postsDirectory)
    const blogSlugs = fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => {
        return {
          slug: fileName.replace(/\.md$/, ""),
        }
      })
    allSlugs.push(...blogSlugs)
  }

  return allSlugs
}
