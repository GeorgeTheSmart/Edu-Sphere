import HomeContent from "@/components/HomeContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LearnSphere | Your Personalized Learning Universe",
  description: "LearnSphere is an adaptive, interactive, and AI-driven platform for personalized learning.",
};

export default function HomePage() {
  return <HomeContent />;
}