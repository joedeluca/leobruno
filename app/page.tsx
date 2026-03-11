import type { Metadata } from "next"
import { getSortedPostsData } from "@/lib/posts"
import HomeClient from "./HomeClient"

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <HomeClient initialPosts={posts} />
    </>
  )
}
