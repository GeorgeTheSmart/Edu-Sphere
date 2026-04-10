import DashboardContent from "@/components/DashboardContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | LearnSphere",
  description: "Track your progress and discover new topics on your personalized LearnSphere dashboard.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}