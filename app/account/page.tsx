import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase"

export const metadata: Metadata = {
  title: "Your Account — Leo Bruno",
}

function formatJoinDate(dateStr: string): string {
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

  // Pull subscriber record
  const { data: subscriber } = await supabaseAdmin
    .from("subscribers")
    .select("first_name, created_at, status")
    .eq("email", user.email!)
    .single()

  // Pull newsletter reads
  const { data: reads } = await supabaseAdmin
    .from("newsletter_reads")
    .select("read_at, newsletters(title, slug, sent_at)")
    .eq("user_id", user.id)
    .order("read_at", { ascending: false })
    .limit(20)

  const firstName = subscriber?.first_name || null
  const joinDate = subscriber?.created_at
    ? formatJoinDate(subscriber.created_at)
    : null

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
                      href={`/newsletter/${read.newsletters.slug}`}
                      className="text-zinc-300 hover:text-zinc-100 transition-colors text-base"
                      style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                    >
                      {read.newsletters.title}
                    </Link>
                    <span
                      className="block text-xs text-zinc-600 mt-0.5"
                      style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                    >
                      {formatJoinDate(read.newsletters.sent_at)}
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
              {subscriber?.status === "active" ? "Active subscriber" : "Inactive"}
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
        </div>
      </div>
    </div>
  )
}
