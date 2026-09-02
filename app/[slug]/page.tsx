import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPostData, getAllPostSlugs, getSortedPostsData } from "@/lib/posts"
import PostPageClient from "./PostPageClient"
import SweetieOrNotPageClient from "./SweetieOrNotPageClient"

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
    const description = post.teaser || post.excerpt
    const imageUrl = post.ogImage
      ? `https://leobruno.it${post.ogImage}`
      : `https://leobruno.it/og-default.jpg`
    return {
      title: post.title,
      description,
      authors: [{ name: "Leo Bruno", url: "https://leobruno.it" }],
      alternates: {
        canonical: `https://leobruno.it/${slug}`,
      },
      openGraph: {
        title: `${post.title} — Leo Bruno`,
        description,
        url: `https://leobruno.it/${slug}`,
        type: "article",
        publishedTime: post.date,
        authors: ["Leo Bruno"],
        images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${post.title} — Leo Bruno`,
        description,
        images: [imageUrl],
      },
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    author: {
      "@type": "Person",
      name: "Leo Bruno",
      url: "https://leobruno.it",
    },
    publisher: {
      "@type": "Person",
      name: "Leo Bruno",
      url: "https://leobruno.it",
    },
    datePublished: post.date,
    description: post.teaser || post.excerpt,
    url: `https://leobruno.it/${slug}`,
  }

  if (post.category === "Sweetie or Not") {
    const allEpisodes = getSortedPostsData().filter(
      (p) => p.category === "Sweetie or Not"
    )
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <SweetieOrNotPageClient post={post} allEpisodes={allEpisodes} />
      </>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PostPageClient post={post} />
    </>
  )
}
