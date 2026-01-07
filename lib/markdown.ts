import fs from "fs"
import path from "path"
import matter from "gray-matter"

const postsDirectory = path.join(process.cwd(), "posts")

export interface MarkdownContent {
  slug: string
  title: string
  titleShort?: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  teaser?: string
  teaserShort?: string
  content: string
  path: string
}

export function getAllMarkdownFiles(dir: string = postsDirectory): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath))
    } else if (item.endsWith(".md")) {
      files.push(fullPath)
    }
  }

  return files
}

export function getMarkdownContent(filePath: string): MarkdownContent {
  const fileContents = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(fileContents)

  const relativePath = path.relative(postsDirectory, filePath)
  const slug = relativePath.replace(/\.md$/, "").replace(/\\/g, "/")

  return {
    slug,
    title: data.title || "",
    titleShort: data.titleShort || data.title || "",
    date: data.date || "",
    category: data.category || "writing",
    tags: data.tags || [],
    excerpt: data.excerpt || "",
    teaser: data.teaser || "",
    teaserShort: data.teaserShort || data.teaser || "",
    content,
    path: relativePath,
  }
}

export function getAllContent(): MarkdownContent[] {
  const files = getAllMarkdownFiles()
  const content = files.map(getMarkdownContent)

  // Sort by date, newest first
  return content.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getContentByCategory(category: string): MarkdownContent[] {
  return getAllContent().filter((item) => item.category === category)
}

export function getContentBySlug(slug: string): MarkdownContent | null {
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`)
    return getMarkdownContent(filePath)
  } catch {
    return null
  }
}
