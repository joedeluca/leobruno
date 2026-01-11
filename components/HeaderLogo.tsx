import Link from "next/link"

export default function HeaderLogo() {
  return (
    <div className="flex flex-col justify-center h-full">
      <Link href="/">
        <h1
          className="text-tiepolo-pink-600 hover:text-tiepolo-pink-700 transition-colors cursor-pointer"
          style={{
            margin: 0,
            lineHeight: 1,
            fontSize: "30px",
          }}
        >
          Leo Bruno
        </h1>
      </Link>
    </div>
  )
}
