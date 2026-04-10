// src/app/dashboard/layout.tsx
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <div className="shadow-md z-50 sticky top-0 bg-white">
        <Navbar />
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden lg:block w-72 shrink-0 border-r bg-white">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
