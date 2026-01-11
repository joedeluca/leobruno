import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

export interface Post {
  slug: string
  title: string
  titleShort?: string
  date: string
  excerpt: string
  category: string
  content?: string
  readTime?: string
  matchSnippet?: string
  teaser?: string
  teaserShort?: string
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
          readTime: `${readTime} min read`,
          teaser: matterResult.data.teaser || "",
          teaserShort:
            matterResult.data.teaserShort || matterResult.data.teaser || "",
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
          content: matterResult.content, // Include raw markdown content
          readTime: `${readTime} min read`,
          teaser: matterResult.data.teaser || "",
          teaserShort:
            matterResult.data.teaserShort || matterResult.data.teaser || "",
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
    .use(html, { sanitize: false })
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Calculate read time
  const words = matterResult.content.split(/\s+/).length
  const readTime = Math.ceil(words / 200)

  return {
    slug,
    title: matterResult.data.title,
    date: matterResult.data.date,
    excerpt: matterResult.data.excerpt || "",
    category: matterResult.data.category || "Essays",
    content: contentHtml,
    readTime: `${readTime} min read`,
    teaser: matterResult.data.teaser || "",
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
