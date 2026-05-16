/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { AnimationProvider } from "@/components/animation-provider"
import { Toaster } from "@/components/ui/toaster"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Care - Your Intelligent Healthcare Companion",
  description:
    "AI-powered healthcare platform. Find doctors, check symptoms, book appointments, and get 24/7 AI medical guidance.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased selection:bg-primary/20" suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnimationProvider>
              <div className="relative flex min-h-screen flex-col">
                {children}
              </div>
              <Toaster />
            </AnimationProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
