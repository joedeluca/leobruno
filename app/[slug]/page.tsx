import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPostData, getAllPostSlugs } from "@/lib/posts"
import PostPageClient from "./PostPageClient"

export async function generateStaticParams() {
  return getAllPostSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await getPostData(slug)
    return {
      title: `${post.title} — Leo Bruno`,
      description: post.teaser || post.excerpt,
    }
  } catch {
    return {}
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let post
  try {
    post = await getPostData(slug)
  } catch {
    notFound()
  }

  return <PostPageClient post={post} />
}
