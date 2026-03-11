import type { Metadata } from "next"
import { getSortedPostsData } from "@/lib/posts"
import { getAllPoems } from "@/lib/poems"
import HomeClient from "./HomeClient"
import type { HomeItem } from "./HomeClient"

export const metadata: Metadata = {
  title: "Leo Bruno — Writer",
  description:
    "Leo Bruno is an American writer living in Sardinia, Italy. Literary fiction, cultural criticism, and essays. Published in Gradiva and I-70 Review.",
  alternates: {
    canonical: "https://leobruno.it",
  },
  openGraph: {
    title: "Leo Bruno — Writer",
    description:
      "Leo Bruno is an American writer living in Sardinia, Italy. Literary fiction, cultural criticism, and essays.",
    url: "https://leobruno.it",
    type: "website",
  },
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Leo Bruno",
  jobTitle: "Writer",
  description:
    "American writer living in Sardinia, Italy. Author of literary fiction and cultural criticism. Published in Gradiva and I-70 Review.",
  url: "https://leobruno.it",
  knowsAbout: [
    "Literary Fiction",
    "Creative Writing",
    "Cultural Criticism",
    "Italian Literature",
  ],
}

export default function Home() {
  const posts = getSortedPostsData()
  const poems = getAllPoems().filter(p => p.author === "Leo Bruno")

  const postItems: HomeItem[] = posts.map(p => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    category: p.category,
    href: `/${p.slug}`,
  }))

  const poemItems: HomeItem[] = poems.map(p => ({
    slug: p.slug,
    title: p.title,
    date: p.date || "2026",
    category: "Poetry",
    href: `/poems/${p.slug}`,
  }))

  // Merge and sort by date descending
  const allItems: HomeItem[] = [...postItems, ...poemItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <HomeClient initialItems={allItems} />
    </>
  )
}
