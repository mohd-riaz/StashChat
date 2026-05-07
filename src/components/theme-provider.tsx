"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Suppress React 19 warning about next-themes injecting an anti-FOUC <script> tag.
// This is a known next-themes / React 19 incompatibility; the script still works.
if (typeof window !== "undefined") {
  const _orig = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return
    _orig(...args)
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}