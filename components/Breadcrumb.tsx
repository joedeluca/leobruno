import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <span className="text-zinc-600 mx-2">/</span>}
          {index === items.length - 1 ? (
            <span
              className="text-zinc-400"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
              style={{ fontFamily: '"Graphik", system-ui, sans-serif' }}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
