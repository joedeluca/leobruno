import fs from "fs"
import path from "path"
import matter from "gray-matter"

const poemsDirectory = path.join(process.cwd(), "poems")

export interface Poem {
  slug: string
  title: string
  author: string
  date: string
  collection?: string
  epigraph?: string
  content: string
}

export function getAllPoems(): Poem[] {
  const fileNames = fs.readdirSync(poemsDirectory)
  const poems = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const fullPath = path.join(poemsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title,
        author: data.author,
        date: data.date,
        collection: data.collection,
        epigraph: data.epigraph,
        content,
      }
    })

  // Sort by author, then title
  return poems.sort((a, b) => {
    const authorCompare = a.author.localeCompare(b.author)
    if (authorCompare !== 0) return authorCompare
    return a.title.localeCompare(b.title)
  })
}

export function getPoemBySlug(slug: string): Poem | null {
  try {
    const fullPath = path.join(poemsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title,
      author: data.author,
      date: data.date,
      collection: data.collection,
      epigraph: data.epigraph,
      content,
    }
  } catch (error) {
    return null
  }
}
