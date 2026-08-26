import CategoryLanding from "@/components/CategoryLanding"

export default function PoemsIndex() {
  return (
    <CategoryLanding
      label="Quartucciu to Cagliari, 2026"
      items={[
        { href: "/poems/sokushinbutsu", title: "Sokushinbutsu" },
      ]}
    />
  )
}
