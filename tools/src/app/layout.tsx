import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIRE Calculator — FIcology101",
  description: "Phase-aware FIRE calculator: model your accumulation, gap years, and retirement in one interactive tool.",
  openGraph: {
    title: "FIRE Calculator — FIcology101",
    description: "Phase-aware FIRE calculator: model your accumulation, gap years, and retirement in one interactive tool.",
    url: "https://tools.ficology101.com/calculator",
    siteName: "FIcology 101",
    images: [
      {
        url: "https://tools.ficology101.com/FIcology101%20Social%20Logo.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
      <GoogleAnalytics gaId="G-931FCTRXS7" />
    </html>
  );
}
