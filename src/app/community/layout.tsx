// src/app/community/layout.tsx
import Navbar from "@/components/Navbar";
import CommunitySidebar from "@/components/CommunitySidebar";
import type { ReactNode } from "react";

export default function CommunityLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <div className="shadow-md">
        <Navbar />
      </div>

      <div className="flex flex-1">
        {/* Community Sidebar */}
        <div className="border-r bg-white w-64">
          <CommunitySidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
