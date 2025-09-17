import type React from "react"
import type { Metadata } from "next"
import { Geist as Geist_Sans, Manrope } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const geistSans = Geist_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Ruvox - Stay Connected, Always",
  description:
    "Modern real-time chat application by Musa Khan. Stay connected with friends and colleagues through seamless messaging.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
