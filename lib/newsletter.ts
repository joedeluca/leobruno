import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const newsletterDirectory = path.join(process.cwd(), "content/newsletter")

export interface NewsletterIssue {
  slug: string
  title: string
  date: string
  excerpt: string
  contentHtml?: string
  rawContent?: string
}

export function getAllNewsletterSlugs(): string[] {
  if (!fs.existsSync(newsletterDirectory)) return []
  return fs
    .readdirSync(newsletterDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
}

export function getAllNewsletterIssues(): Omit<NewsletterIssue, "contentHtml">[] {
  if (!fs.existsSync(newsletterDirectory)) return []
  return fs
    .readdirSync(newsletterDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "")
      const fileContents = fs.readFileSync(
        path.join(newsletterDirectory, f),
        "utf8"
      )
      const { data } = matter(fileContents)
      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        excerpt: data.excerpt || "",
      }
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export async function getNewsletterIssue(
  slug: string
): Promise<NewsletterIssue | null> {
  const fullPath = path.join(newsletterDirectory, `${slug}.md`)
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  const processed = await remark()
    .use(html, { sanitize: false })
    .process(content)

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    excerpt: data.excerpt || "",
    contentHtml: processed.toString(),
    rawContent: content,
  }
}
