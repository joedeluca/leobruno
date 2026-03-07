import Link from "next/link"
import { getSortedPostsData } from "@/lib/posts"

export default function FieldNotesIndex() {
  const posts = getSortedPostsData().filter((p) => p.category === "Field Notes")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pb-48 pt-16 text-center">
      <p style={{
        fontFamily: '"Graphik", system-ui, sans-serif',
        fontSize: '17px',
        letterSpacing: '0.15em',
        color: '#5a4a3a',
        textTransform: 'uppercase',
        marginBottom: '3rem',
      }}>
        Field Notes
      </p>
      {posts.map((post, i) => (
        <Link
          key={post.slug}
          href={`/${post.slug}`}
          style={{
            fontFamily: '"Schnyder S", Georgia, serif',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            color: '#E8DCC8',
            lineHeight: 1.1,
            display: 'block',
            marginBottom: i < posts.length - 1 ? '2.5rem' : 0,
          }}
        >
          {post.title}
        </Link>
      ))}
    </div>
  )
}
