"use client"

import * as React from "react"
import { ThemeProviderContext } from "@/contexts/theme-context"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Force light theme - ignore localStorage and system preferences
  const [theme] = React.useState<Theme>("light")

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const root = window.document.documentElement

    root.classList.remove("light", "dark")
    root.classList.add("light")
  }, [])

  const value = {
    theme: "light" as Theme,
    setTheme: () => {
      // Theme is forced to light, no-op
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
