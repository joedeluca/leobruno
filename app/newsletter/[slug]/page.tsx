import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllNewsletterSlugs, getNewsletterIssue } from "@/lib/newsletter"
import { createSupabaseServerClient } from "@/lib/supabase"
import ReadTracker from "./ReadTracker"
import NewsletterPageClient from "./NewsletterPageClient"

export async function generateStaticParams() {
  return getAllNewsletterSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const issue = await getNewsletterIssue(slug)
  if (!issue) return {}
  return { title: `${issue.title} — Leo Bruno` }
}

export default async function NewsletterIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const issue = await getNewsletterIssue(slug)
  if (!issue) notFound()

  // Check if the visitor is logged in (to conditionally show ReadTracker)
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <NewsletterPageClient
        slug={slug}
        title={issue.title}
        date={issue.date}
        contentHtml={issue.contentHtml!}
        rawContent={issue.rawContent ?? ""}
      />
      {user && (
        <ReadTracker
          slug={slug}
          title={issue.title}
          type="newsletter"
          url={`/newsletter/${slug}`}
        />
      )}
    </>
  )
}
