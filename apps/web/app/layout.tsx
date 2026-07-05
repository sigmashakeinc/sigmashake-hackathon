import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

const APP_NAME = "SigmaShake Hackathon";
const APP_DESCRIPTION = "An invite-only collaborative workstation for hackathon teams. Manage participation, planning, development, submission, and judging.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hack.sigmashake.com";

export const metadata: Metadata = {
  title: {
    template: `%s — ${APP_NAME}`,
    default: `${APP_NAME} — Collaborative Hackathon Platform`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/logo-192.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e01e2e",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="text-body-sm font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
