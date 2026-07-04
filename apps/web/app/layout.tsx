import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SigmaShake Hackathon",
  description: "AI-native hackathon operations for Sigma Shake"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
