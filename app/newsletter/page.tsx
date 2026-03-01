import Link from "next/link"
import { getAllNewsletterIssues } from "@/lib/newsletter"
import { formatArticleDate } from "@/lib/formatDate"
import SubscribeForm from "./SubscribeForm"

export const metadata = {
  title: "Newsletter — Leo Bruno",
  description:
    "Subscribe to the Leo Bruno newsletter. An actual human voice. Irregular. Honest.",
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-6 py-3 border-b border-zinc-800/60">
      <span
        className="w-36 flex-shrink-0 text-xs uppercase tracking-widest text-zinc-500"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
      >
        {label}
      </span>
      <span
        className="text-zinc-400"
        style={{ fontFamily: '"Graphik", system-ui, sans-serif', fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)" }}
      >
        {value}
      </span>
    </div>
  )
}

export default function NewsletterPage() {
  const issues = getAllNewsletterIssues()

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main — 75% */}
      <div className="lg:w-3/4 w-full px-8 pb-12 pt-[.8rem] lg:pr-8 lg:border-r lg:border-[#3A2E24]">

        {/* Eyebrow */}
        <p
          className="text-xs uppercase tracking-widest text-tiepolo-pink-600 mb-8"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          The Newsletter
        </p>

        {/* Headline */}
        <h1
          className="text-zinc-200 leading-tight mb-10 font-normal"
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
            lineHeight: 1.08,
          }}
        >
          Inside the{" "}
          <em className="text-zinc-500 not-italic italic">black hole.</em>
        </h1>

        {/* Body copy */}
        <div
          className="space-y-6 text-zinc-400 leading-relaxed mb-10"
          style={{
            fontFamily: '"Graphik", system-ui, sans-serif',
            fontSize: "clamp(1.05rem, 1.6vw, 1.25rem)",
          }}
        >
          <p>
            Why subscribe to my newsletter? Think of it as {" "}
            <strong className="text-zinc-200 font-normal">
              proximity to the most anonymous person on the internet
            </strong>. The equivalent of reading the OED in a public library circa 1989.{" "}
            Sure, there's the Rolling Stone interview nobody read. And the thirty
            Sardinians who ride the bus with me every day. And the literary journal stuff that nobody with a pulse has read. But, that's my <sup className="text-tiepolo-pink-600 ml-0.5 text-sm">*</sup>entire
            public footprint.
          </p>
        </div>

        {/* Pull quote */}
        <blockquote
          className="my-10 pl-6 border-l-2 border-tiepolo-pink-600 text-zinc-300 leading-snug"
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)",
            fontStyle: "italic",
            background: "linear-gradient(90deg, rgba(180,40,30,0.07), transparent)",
            padding: "1.5rem 1.5rem 1.5rem 1.5rem",
          }}
        >
          "Tell your friends about it and they'll immediately think you've been
          swallowed by a black hole."
        </blockquote>

        <div
          className="space-y-6 text-zinc-400 leading-relaxed mb-12"
          style={{
            fontFamily: '"Graphik", system-ui, sans-serif',
            fontSize: "clamp(1.05rem, 1.6vw, 1.25rem)",
          }}
        >
          <p>
            But inside the black hole you'll find something strange, evocative - like a 
            tomato that tastes like - oh. my. god. A tomato! Yes dear reader, we're talking about{" "}
            <strong className="text-zinc-200 font-normal">
              an actual human voice.
            </strong>{" "}
            A singular and worthless thing in this fantastic world of robots and
            space rockets.
          </p>
          <p>
            A voice that will sound off on whatever, whenever, in patterns so
            befuddling — and at the same time so stubbornly{" "}
            <em>real</em> — that you will find yourself checking your inbox not
            because you're expecting anything in particular, but because you've
            forgotten what that feels like.
          </p>
          <p>
            Best of all subscribing is essentially an anonymizer. No algorithm knows you're
            here. No engagement metrics are being optimized. No one is trying to
            sell you a mattress. Just you, me and the void.
          </p>
        </div>

        {/* Specs */}
        <div className="mb-12">
          <Spec label="Frequency" value="Irregular. Honest." />
          <Spec
            label="Subject matter"
            value="Whatever's pressing. Medieval Sardinia. Bad weather. Books. Francis of Assisi. Running uphill."
          />
          <Spec
            label="Tone"
            value="American-Italian. Which is to say: slightly too earnest for both countries."
          />
          <Spec label="Cost" value="Free. Like the bus." />
        </div>

        {/* Form */}
        <SubscribeForm />

              {/* Footnote */}
        <p
          className="text-zinc-600 text-xs leading-relaxed mb-10 border-t border-zinc-800 pt-4"
          style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
        >
          <sup className="text-tiepolo-pink-600 mr-1">*</sup>
          Yeah, this is all lies.{" "}
          <a
            href="https://www.instagram.com/theleobruno/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            Instagram
          </a>
          {" · "}
          <a
            href="https://www.youtube.com/@TheLeoBruno"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            YouTube
          </a>
        </p>
      </div>

      {/* Sidebar — 25% */}
      <div className="lg:w-1/4 w-full px-8 pb-12 pt-[.8rem] lg:pl-8 mt-8 lg:mt-0">
        <aside className="space-y-8">

          {/* Archive */}
          {issues.length > 0 && (
            <div>
              <h3
                className="text-xs uppercase tracking-widest text-zinc-500 mb-4"
                style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
              >
                Archive
              </h3>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <Link
                    key={issue.slug}
                    href={`/newsletter/${issue.slug}`}
                    className="block group"
                  >
                    <span
                      className="block text-zinc-300 group-hover:text-white transition-colors leading-snug"
                      style={{
                        fontFamily: '"Graphik", system-ui, sans-serif',
                        fontSize: "1rem",
                      }}
                    >
                      {issue.title}
                    </span>
                    {issue.date && (
                      <span
                        className="text-xs text-zinc-600 mt-0.5 block"
                        style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
                      >
                        {formatArticleDate(issue.date)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          <div className="border-t border-zinc-800 pt-6">
            <h3
              className="text-xs uppercase tracking-widest text-zinc-500 mb-3"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              About
            </h3>
            <p
              className="text-zinc-500 text-sm leading-relaxed"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              Leo Bruno is a writer living in Sardegna. Est.{" "}
              Montelepre → Kansas City → Assisi → Sardinia.
            </p>
          </div>

        </aside>
      </div>
    </div>
  )
}