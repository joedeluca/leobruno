import type { Metadata } from "next"
import AboutClient from "./AboutClient"

export const metadata: Metadata = {
  title: "About",
  description:
    "Leo Bruno is an American writer living in Sardinia, Italy. Literary fiction, cultural criticism, and essays. Published in Gradiva and I-70 Review.",
  alternates: {
    canonical: "https://leobruno.it/about",
  },
  openGraph: {
    title: "About — Leo Bruno",
    description:
      "Leo Bruno is an American writer living in Sardinia, Italy.",
    url: "https://leobruno.it/about",
    type: "profile",
  },
}

export default function AboutPage() {
  return <AboutClient />
}
