import Link from "next/link"

export default function HeaderLogo() {
  return (
    <div className="flex flex-col justify-center h-full">
      <Link href="/">
        <img
          src="/leo-bruno-logo.png"
          alt="Leo Bruno"
          className="hover:opacity-80 transition-opacity cursor-pointer"
          style={{ height: "100px", width: "auto" }}
        />
      </Link>
    </div>
  )
}
