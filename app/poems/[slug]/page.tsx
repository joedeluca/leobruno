import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllPoems, getPoemBySlug } from "@/lib/poems"
import PoemPageClient from "./PoemPageClient"

export async function generateStaticParams() {
  return getAllPoems().map((poem) => ({ slug: poem.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const poem = getPoemBySlug(slug)
  if (!poem) return {}

  const description = poem.collection
    ? `${poem.title} by ${poem.author}, from ${poem.collection}.`
    : `${poem.title} by ${poem.author}.`

  return {
    title: poem.title,
    description,
    authors: [{ name: poem.author }],
    alternates: {
      canonical: `https://leobruno.it/poems/${slug}`,
    },
    openGraph: {
      title: `${poem.title} — Leo Bruno`,
      description,
      url: `https://leobruno.it/poems/${slug}`,
      type: "article",
      authors: [poem.author],
      images: [
        {
          url: "https://leobruno.it/og-default.jpg",
          width: 1200,
          height: 630,
          alt: poem.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${poem.title} — Leo Bruno`,
      description,
      images: ["https://leobruno.it/og-default.jpg"],
    },
  }
}

export default async function PoemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Read on the server, from the markdown, the way every other document route
  // on this site already does. It used to be "use client" with a useEffect
  // fetch of /api/poem/<slug>, which meant the poem existed only after
  // JavaScript ran: the HTML that went out carried the header, the footer and
  // 28 words of chrome. Anything that reads pages rather than running them —
  // a crawler, a search index, a preview card — saw a site with no poems on it.
  const poem = getPoemBySlug(slug)
  if (!poem) notFound()

  const poemSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `https://leobruno.it/poems/${slug}`,
    name: poem.title,
    headline: poem.title,
    genre: "Poetry",
    author: {
      "@type": "Person",
      name: poem.author,
    },
    publisher: {
      "@type": "Person",
      name: "Leo Bruno",
      url: "https://leobruno.it",
    },
    ...(poem.date ? { datePublished: poem.date } : {}),
    ...(poem.collection ? { isPartOf: poem.collection } : {}),
    url: `https://leobruno.it/poems/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(poemSchema) }}
      />
      {/* The fade-in starts the poem at opacity 0 and gsap brings it up. With
          JavaScript off nothing would ever bring it up, so the text would be in
          the HTML and still invisible — which is the same bug wearing a
          different hat. */}
      <noscript>
        <style>{`.poem-content { opacity: 1 !important; }`}</style>
      </noscript>
      <PoemPageClient poem={poem} />
    </>
  )
}
