import CategoryLanding from "@/components/CategoryLanding"

export default function FictionIndex() {
  return (
    <CategoryLanding
      label="Reliquary, 2026"
      items={[
        { href: "/little-black-submarine", title: "Little Black Submarine" },
        { href: "/easy-tommy-lee", title: "Easy. Tommy Lee." },
      ]}
    />
  )
}
