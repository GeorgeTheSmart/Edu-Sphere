"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BrainCircuit } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Determine if the current route is protected (anything other than root "/")
    const isProtectedRoute = pathname !== "/";

    if (isProtectedRoute) {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        // Not authenticated: Redirect to home where the login modal is.
        router.replace("/");
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(true); // Public route
    }
  }, [pathname, router]);

  // Optionally listen for storage events to handle logout across tabs
  useEffect(() => {
    const handleStorage = () => {
      if (pathname !== "/" && !localStorage.getItem("userId")) {
        router.replace("/");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <BrainCircuit className="w-12 h-12 text-indigo-600 animate-pulse mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Securing your session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
