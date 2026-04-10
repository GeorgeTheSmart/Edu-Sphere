"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, Target, ChevronRight } from "lucide-react";


const learning = [
  {
    name: "Gamification",
    href: "/learning/gamification",
    icon: Target,
    description: "Learn through games and challenges",
  },
  {
    name: "Parent",
    href: "/learning/parent",
    icon: Users,
    description: "Parenting guidance and resources",
  },
  {
    name: "Practice",
    href: "/learning/practice",
    icon: BookOpen,
    description: "Hands-on learning exercises",
  },
];

export default function SubjectsSidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-sm"
      role="navigation"
      aria-label="Subject navigation"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          Learing
        </h2>
        <p className="text-sm text-slate-600 mt-1">Choose your learning path</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {/* Link to All Subjects */}
        <Link
          href="/learning"
          className={`
            group relative flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
            ${
              pathname === "/learing"
                ? "bg-indigo-100 text-indigo-700 shadow-sm border-l-4 border-indigo-600"
                : "text-slate-700 hover:text-indigo-700 hover:bg-slate-100"
            }
          `}
          aria-current={pathname === "/learning" ? "page" : undefined}
        >
          <BookOpen
            className={`
              h-5 w-5 mr-3 transition-colors duration-200
              ${pathname === "/learning" ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}
            `}
          />
          <div className="flex-1 min-w-0 font-semibold">All Subjects</div>
          <ChevronRight
            className={`
              h-4 w-4 transition-all duration-200
              ${
                pathname === "/learning"
                  ? "text-indigo-600 opacity-100"
                  : "text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 group-hover:translate-x-0.5"
              }
            `}
          />
          {pathname === "/learning" && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
          )}
        </Link>

        {/* Existing subject links */}
        {learning.map((subject) => {
          const Icon = subject.icon;
          const isActive = pathname === subject.href;

          return (
            <Link
              key={subject.name}
              href={subject.href}
              className={`
                group relative flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700 shadow-sm border-l-4 border-indigo-600"
                    : "text-slate-700 hover:text-indigo-700 hover:bg-slate-100"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`
                  h-5 w-5 mr-3 transition-colors duration-200
                  ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}
                `}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{subject.name}</div>
                <div
                  className={`
                    text-xs mt-0.5 transition-colors duration-200
                    ${isActive ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-600"}
                  `}
                >
                  {subject.description}
                </div>
              </div>
              <ChevronRight
                className={`
                  h-4 w-4 transition-all duration-200
                  ${
                    isActive
                      ? "text-indigo-600 opacity-100"
                      : "text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 group-hover:translate-x-0.5"
                  }
                `}
              />
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500 text-center">{learning.length} subjects available</div>
      </div>
    </nav>
  );
}
