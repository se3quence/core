import "./globals.css";
import type { Metadata, Viewport } from "next";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import { SWRConfig } from "swr";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Sequence3 - Dashboard",
  description: "Get started with Sequence3",
  icons: {
    icon: "/Q.svg",
    shortcut: "/Q.svg",
    apple: "/Q.svg",
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <SWRConfig
            value={{
              fallback: {
                // We do NOT await here
                // Only components that read this data will suspend
                "/api/user": getUser(),
                "/api/team": getTeamForUser(),
              },
            }}
          >
            {children}
          </SWRConfig>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
