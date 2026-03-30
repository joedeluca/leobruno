import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

export interface CopywriterPdf {
  label: string
  file: string
}

export interface CopywriterProject {
  slug: string
  title: string
  teaser: string
  client: string
  type: string
  date: string
  order: number
  pdfs?: CopywriterPdf[]
  content?: string
}

const copywriterDirectory = path.join(process.cwd(), "copywriter")

export function getAllCopywriterProjects(): CopywriterProject[] {
  const fileNames = fs.readdirSync(copywriterDirectory)
  const projects = fileNames
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const fullPath = path.join(copywriterDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data } = matter(fileContents)
      return {
        slug,
        title: data.title,
        teaser: data.teaser || "",
        client: data.client || "",
        type: data.type || "",
        date: data.date,
        order: data.order ?? 99,
        pdfs: data.pdfs || [],
      }
    })
  return projects.sort((a, b) => a.order - b.order)
}

export async function getCopywriterProject(slug: string): Promise<CopywriterProject> {
  const fullPath = path.join(copywriterDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  const processed = await remark()
    .use(html, { sanitize: false })
    .process(content)

  return {
    slug,
    title: data.title,
    teaser: data.teaser || "",
    client: data.client || "",
    type: data.type || "",
    date: data.date,
    order: data.order ?? 99,
    pdfs: data.pdfs || [],
    content: processed.toString(),
  }
}

export function getAllCopywriterSlugs() {
  const fileNames = fs.readdirSync(copywriterDirectory)
  return fileNames
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, "") }))
}
