import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase"
import SignOutButton from "@/components/SignOutButton"

export const metadata: Metadata = {
  title: "Your Account — Leo Bruno",
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const firstName = (user.user_metadata?.first_name as string) || null
  const joinDate = user.created_at ? formatDate(user.created_at) : null

  // Pull reading history
  const { data: reads } = await supabaseAdmin
    .from("reads")
    .select("slug, title, type, url, read_at")
    .eq("user_id", user.id)
    .order("read_at", { ascending: false })
    .limit(50)

  // Pull Sweetie or Not vote history
  const { data: votes } = await supabaseAdmin
    .from("sweetie_votes")
    .select("episode_slug, verdict, reasoning, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="lg:w-3/4 w-full px-8 pb-12 pt-[.8rem] lg:pr-8 lg:border-r lg:border-zinc-800">
        <div className="max-w-xl pt-12">
          <p
            className="text-xs uppercase tracking-wider text-zinc-500 mb-8"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            Your Account
          </p>

          <h1
            className="text-3xl text-zinc-100 mb-2 leading-tight"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            {firstName ? `Hello, ${firstName}.` : "Hello."}
          </h1>

          <p
            className="text-zinc-600 text-sm mb-12"
            style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
          >
            {user.email}
            {joinDate && (
              <span className="ml-3 pl-3 border-l border-zinc-800">
                Subscriber since {joinDate}
              </span>
            )}
          </p>

          {/* Newsletter History */}
          <div className="border-t border-zinc-800 pt-8">
            <h2
              className="text-xs uppercase tracking-wider text-zinc-500 mb-6"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              Issues
            </h2>

            {reads && reads.length > 0 ? (
              <ul className="space-y-4">
                {reads.map((read: any, i: number) => (
                  <li key={i}>
                    <Link
                      href={read.url}
                      className="text-zinc-300 hover:text-zinc-100 transition-colors text-base"
                      style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                    >
                      {read.title}
                    </Link>
                    <span
                      className="block text-xs text-zinc-600 mt-0.5"
                      style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                    >
                      {formatDate(read.read_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="text-zinc-600 text-sm"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                No issues yet. First one coming soon.
              </p>
            )}
          </div>

          {/* Sweetie or Not Verdicts */}
          {votes && votes.length > 0 && (
            <div className="border-t border-zinc-800 pt-8 mt-8">
              <h2
                className="text-xs uppercase tracking-wider text-zinc-500 mb-6"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                Sweetie or Not — Your Verdicts
              </h2>
              <ul className="space-y-4">
                {(votes as any[]).map((vote, i) => {
                  const labelMap: Record<string, string> = {
                    sweetie: "Sweetie",
                    penitent: "Penitent",
                    not_a_sweetie: "Not a Sweetie",
                  }
                  return (
                    <li key={i}>
                      <Link
                        href={`/${vote.episode_slug}`}
                        className="text-zinc-300 hover:text-zinc-100 transition-colors text-base"
                        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                      >
                        {vote.episode_slug.replace("sweetie-or-not-", "").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </Link>
                      <span
                        className="block text-xs text-zinc-500 mt-0.5"
                        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                      >
                        {labelMap[vote.verdict] || vote.verdict}
                        {vote.reasoning && (
                          <span className="text-zinc-600"> — &ldquo;{vote.reasoning}&rdquo;</span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Sidebar column */}
      <div className="lg:w-1/4 w-full px-8 pb-12 pt-[.8rem] lg:pl-8 mt-8 lg:mt-0">
        <div className="pt-12 space-y-6">
          <div>
            <p
              className="text-xs uppercase tracking-wider text-zinc-500 mb-3"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              Status
            </p>
            <p
              className="text-zinc-400 text-sm"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              Active subscriber
            </p>
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              ← All writing
            </Link>
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
