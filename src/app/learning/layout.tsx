import Navbar from "@/components/Navbar";
import SubjectsSidebar from "@/components/SubjectsSidebar";
import type { ReactNode } from "react";

export default function SubjectsLayout({
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
        {/* Sidebar */}
        <div className="border-r bg-white w-64">
          <SubjectsSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
