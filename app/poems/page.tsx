import CategoryLanding from "@/components/CategoryLanding"

export default function PoemsIndex() {
  return (
    <CategoryLanding
      label="Quartucciu to Cagliari, 2026"
      items={[
        { href: "/poems/ode-to-the-girl-on-the-bus", title: "Ode to the Girl on the Bus" },
        { href: "/poems/sokushinbutsu", title: "Sokushinbutsu" },
      ]}
    />
  )
}
