"use client";

import { useState, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Bell, 
  User, 
  Settings,
  ChevronRight,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { 
      name: "Overview", 
      href: "/dashboard", 
      icon: Home,
      description: "Dashboard home"
    },
    { 
      name: "My Courses", 
      href: "/dashboard/courses", 
      icon: BookOpen,
      description: "View your courses"
    },
    { 
      name: "Notifications", 
      href: "/dashboard/notifications", 
      icon: Bell,
      description: "Recent updates"
    },
    { 
      name: "Profile", 
      href: "/dashboard/profile", 
      icon: User,
      description: "Manage profile"
    },
    { 
      name: "Settings", 
      href: "/dashboard/settings", 
      icon: Settings,
      description: "Account settings"
    },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">LS</span>
            </div>
            <span className="font-bold text-lg">LearnSphere</span>
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-white shadow-xl lg:shadow-none border-r border-gray-200 transform transition-all duration-300 ease-in-out z-30 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Desktop Header */}
        <div className="hidden lg:block p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">LS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LearnSphere</h1>
              <p className="text-sm text-gray-500">Learning Dashboard</p>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">LS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LearnSphere</h1>
              <p className="text-sm text-gray-500">Learning Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" role="menu">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:translate-x-1"
                }`}
                role="menuitem"
                tabIndex={0}
                aria-current={isActive ? "page" : undefined}
                title={item.description}
              >
                <Icon 
                  size={20} 
                  className={`mr-3 transition-colors ${
                    isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"
                  }`} 
                />
                <div className="flex-1">
                  <span className={`font-medium ${isActive ? "text-white" : ""}`}>
                    {item.name}
                  </span>
                  <p className={`text-xs mt-0.5 ${
                    isActive ? "text-indigo-100" : "text-gray-500 group-hover:text-gray-600"
                  }`}>
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight 
                    size={16} 
                    className="text-white ml-2 animate-pulse" 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Need Help?</h3>
            <p className="text-xs text-gray-600 mb-3">
              Check out our learning resources and tutorials.
            </p>
            <button className="w-full bg-white text-indigo-600 text-sm font-medium py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm border border-indigo-100">
              Get Support
            </button>
          </div>
          
          <button 
            onClick={() => {
              localStorage.removeItem("userId");
              localStorage.removeItem("learnsphere_user_name");
              localStorage.removeItem("learnsphere_user_email");
              localStorage.removeItem("learnsphere_user_phone");
              window.location.href = "/";
            }}
            className="w-full flex items-center justify-center space-x-2 text-red-600 bg-red-50 text-sm font-semibold py-3 px-3 rounded-xl hover:bg-red-100/80 transition-colors shadow-sm border border-red-100"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Enhanced Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-20 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}