import type { Metadata } from "next"
import { Inter, Noto_Sans_Hebrew } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const notoHebrew = Noto_Sans_Hebrew({
  variable: "--font-hebrew",
  subsets: ["hebrew"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "BuildWise — ניהול תפעול",
  description: "מערכת ניהול תפעול לחברות בנייה והנדסה",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${inter.variable} ${notoHebrew.variable} antialiased`}
        style={{ fontFamily: "var(--font-hebrew), var(--font-sans), sans-serif" }}
      >
        {children}
        <Toaster position="top-left" richColors />
      </body>
    </html>
  )
}
