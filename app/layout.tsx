import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nashuha & Shafiq | Digital Wedding Card",
  description: "Mobile digital wedding invitation for Fatin Nashuha and Mohamad Shafiq.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}

