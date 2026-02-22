import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllNewsletterSlugs, getNewsletterIssue } from "@/lib/newsletter"
import { createSupabaseServerClient } from "@/lib/supabase"
import { formatArticleDate } from "@/lib/formatDate"
import ReadTracker from "./ReadTracker"

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
    <div className="max-w-2xl mx-auto px-8 py-16">
      <p
        className="text-xs uppercase tracking-wider text-zinc-500 mb-8"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        Newsletter
      </p>

      <h1
        className="text-3xl text-zinc-100 mb-3 leading-tight"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        {issue.title}
      </h1>

      {issue.date && (
        <p
          className="text-zinc-600 text-sm mb-12"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          {formatArticleDate(issue.date)}
        </p>
      )}

      <div
        className="prose prose-invert prose-zinc max-w-none"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        dangerouslySetInnerHTML={{ __html: issue.contentHtml! }}
      />

      {/* Record this as read for logged-in users */}
      {user && (
        <ReadTracker
          slug={slug}
          title={issue.title}
          type="newsletter"
          url={`/newsletter/${slug}`}
        />
      )}
    </div>
  )
}
