import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getCopywriterProject, getAllCopywriterSlugs } from "@/lib/copywriter"
import CopywriterPageClient from "./CopywriterPageClient"

export async function generateStaticParams() {
  return getAllCopywriterSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const project = await getCopywriterProject(slug)
    return {
      title: project.title,
      description: `${project.teaser} — ${project.client}`,
    }
  } catch {
    return {}
  }
}

export default async function CopywriterProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let project
  try {
    project = await getCopywriterProject(slug)
  } catch {
    notFound()
  }
  return <CopywriterPageClient project={project} />
}
