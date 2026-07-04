import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Nashuha & Shafiq | Digital Wedding Card",
  description: "Mobile digital wedding invitation for Fatin Nashuha and Mohamad Shafiq.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ms">
      <body className={`${kadSerif.variable} ${kadScript.variable} ${kadSans.variable}`}>{children}</body>
    </html>
  );
}
