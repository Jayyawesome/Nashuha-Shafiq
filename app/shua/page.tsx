import type { Metadata } from "next";
import { ShuaCard } from "./ShuaCard";

export const metadata: Metadata = {
  title: "Nashuha & Shafiq | Digital Wedding Card",
  description: "Mobile digital wedding invitation for Fatin Nashuha and Mohamad Shafiq.",
};

export default function ShuaPage() {
  return <ShuaCard />;
}

