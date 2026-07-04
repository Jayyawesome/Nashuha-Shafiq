import type { Metadata, Viewport } from "next";
import { Cormorant, Great_Vibes, League_Spartan } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const kadSerif = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kad-serif",
  display: "swap",
});

const kadScript = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kad-script",
  display: "swap",
});

const kadSans = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-kad-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#2f0714" },
    { media: "(prefers-color-scheme: light)", color: "#2f0714" },
  ],
};

export const metadata: Metadata = {
  title: "Nashuha & Shafiq | Walimatul Urus 22 Ogos 2026",
  description:
    "Kad jemputan digital perkahwinan Fatin Nashuha Binti Jeffri dan Mohamad Shafiq Bin Mohd Shakri. Sabtu, 22 Ogos 2026 di Kulim Golf Resort & Country.",
  keywords: ["wedding", "kad kahwin", "digital invitation", "Nashuha", "Shafiq", "walimatul urus"],
  authors: [{ name: "The Digital Yes" }],
  openGraph: {
    type: "website",
    title: "Nashuha & Shafiq | Walimatul Urus",
    description: "Anda dijemput ke majlis perkahwinan Fatin Nashuha & Mohamad Shafiq. 22 Ogos 2026.",
    locale: "ms_MY",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body className={`${kadSerif.variable} ${kadScript.variable} ${kadSans.variable}`}>{children}</body>
    </html>
  );
}
