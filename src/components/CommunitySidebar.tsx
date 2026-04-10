// src/components/CommunitySidebar.tsx

"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { 
  FolderOpen, 
  Users, 
  FileText, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Hash,
  ChevronRight
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  badge?: number;
}

export default function CommunitySidebar() {
  const pathname = usePathname();
  
  const mainNavItems: NavItem[] = [
    { 
      href: "/community/category", 
      label: "Categories", 
      icon: FolderOpen,
      description: "Browse topics"
    },
    { 
      href: "/community/peers", 
      label: "Peers", 
      icon: Users,
      description: "Connect with members",
      badge: 12
    },
    { 
      href: "/community/post", 
      label: "Posts", 
      icon: FileText,
      description: "Latest discussions"
    }
  ];

  const quickActions: NavItem[] = [
    { href: "/community/trending", label: "Trending", icon: TrendingUp },
    { href: "/community/events", label: "Events", icon: Calendar },
    { href: "/community/tags", label: "Tags", icon: Hash }
  ];

  const isActiveLink = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <nav className="flex flex-col bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 h-full min-w-[280px] shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Community</h2>
            <p className="text-sm text-slate-500">Connect & Share</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Main
          </h3>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-400'}`} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Quick Access
          </h3>
          {quickActions.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/community/create-post"
          className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <FileText className="w-4 h-4" />
          Create Post
        </Link>
      </div>
    </nav>
  );
}