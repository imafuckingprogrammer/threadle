import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadle — Unravel the word, one thread at a time",
  description:
    "A daily word puzzle. Bridge two words by changing one letter at a time. Discover the most elegant path.",
  openGraph: {
    title: "Threadle",
    description: "Unravel the word, one thread at a time.",
    type: "website",
    siteName: "Threadle",
  },
  twitter: {
    card: "summary",
    title: "Threadle",
    description: "Unravel the word, one thread at a time.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F4F3EF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
