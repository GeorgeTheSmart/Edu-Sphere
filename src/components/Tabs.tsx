"use client";

import { useState, useId, ReactNode, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

type TabItem = {
  id?: string;
  title: string;
  panel: ReactNode;
};

export default function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTab = tabRefs.current[active];
    const indicator = indicatorRef.current;
    
    if (activeTab && indicator) {
      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = activeTab.parentElement?.getBoundingClientRect();
      
      if (containerRect) {
        const left = tabRect.left - containerRect.left;
        const width = tabRect.width;
        
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
      }
    }
  }, [active]);

  // Enhanced keyboard navigation
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const preventDefault = () => e.preventDefault();
    
    switch (e.key) {
      case "ArrowRight":
        preventDefault();
        setActive((i) => (i + 1) % tabs.length);
        setFocusedIndex((i) => (i + 1) % tabs.length);
        break;
      case "ArrowLeft":
        preventDefault();
        setActive((i) => (i - 1 + tabs.length) % tabs.length);
        setFocusedIndex((i) => (i - 1 + tabs.length) % tabs.length);
        break;
      case "Home":
        preventDefault();
        setActive(0);
        setFocusedIndex(0);
        break;
      case "End":
        preventDefault();
        setActive(tabs.length - 1);
        setFocusedIndex(tabs.length - 1);
        break;
      case "Enter":
      case " ":
        preventDefault();
        if (focusedIndex >= 0) {
          setActive(focusedIndex);
        }
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && tabRefs.current[focusedIndex]) {
      tabRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleTabClick = (index: number) => {
    setActive(index);
    setFocusedIndex(index);
  };

  const handleTabFocus = (index: number) => {
    setFocusedIndex(index);
  };

  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Content tabs"
        className="relative flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 shadow-sm"
        onKeyDown={onKeyDown}
      >
        {/* Animated indicator */}
        <div
          ref={indicatorRef}
          className="absolute top-1 bottom-1 bg-white rounded-lg shadow-md transition-all duration-300 ease-out"
          style={{ left: '4px', width: '0px' }}
        />
        
        {tabs.map((t, i) => {
          const tabId = `${baseId}-tab-${i}`;
          const panelId = `${baseId}-panel-${i}`;
          const isActive = i === active;
          const isFocused = i === focusedIndex;
          
          return (
            <button
              key={t.id || t.title}
              ref={(el) => (tabRefs.current[i] = el)}
              id={tabId}
              aria-controls={panelId}
              aria-selected={isActive}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabClick(i)}
              onFocus={() => handleTabFocus(i)}
              className={`
                relative z-10 flex-1 px-4 py-3 text-sm font-medium rounded-lg
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100
                ${isActive 
                  ? "text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }
                ${isFocused && !isActive ? "bg-white/30" : ""}
              `}
            >
              <span className="relative z-10">{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panels with smooth transitions */}
      <div className="relative min-h-[200px]">
        {tabs.map((t, i) => {
          const panelId = `${baseId}-panel-${i}`;
          const tabId = `${baseId}-tab-${i}`;
          const isActive = i === active;
          
          return (
            <div
              key={t.id || t.title}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              className={`
                absolute inset-0 transition-all duration-300 ease-out
                ${isActive 
                  ? "opacity-100 translate-y-0 pointer-events-auto" 
                  : "opacity-0 translate-y-2 pointer-events-none"
                }
              `}
              tabIndex={isActive ? 0 : -1}
            >
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                {t.panel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Demo component to show the enhanced tabs in action
function TabsDemo() {
  const demoTabs = [
    {
      title: "Overview",
      panel: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">Welcome to the Overview</h3>
          <p className="text-slate-600 leading-relaxed">
            This enhanced tabs component features smooth animations, better accessibility, 
            and a modern design. The active tab indicator smoothly slides between tabs 
            as you navigate.
          </p>
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      title: "Features",
      panel: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">Enhanced Features</h3>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Smooth sliding indicator animation
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Improved keyboard navigation (Arrow keys, Home, End, Enter, Space)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Better focus management and accessibility
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Fade and slide transitions for content panels
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Modern glassmorphism-inspired design
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Settings",
      panel: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">Configuration Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Animation Speed</h4>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Theme Mode</h4>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-slate-200 rounded text-sm">Light</button>
                <button className="px-3 py-1 bg-slate-800 text-white rounded text-sm">Dark</button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "About",
      panel: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">About This Component</h3>
          <p className="text-slate-600 leading-relaxed">
            This enhanced tabs component combines modern design principles with 
            accessibility best practices. It's built with React and uses Tailwind CSS 
            for styling, featuring smooth animations powered by CSS transitions.
          </p>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 Try using keyboard navigation: Use arrow keys to navigate between tabs, 
              Home/End to jump to first/last tab, and Enter or Space to activate the focused tab.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Enhanced Tabs Component</h1>
        <p className="text-slate-600">A modern, accessible, and beautifully animated tabs interface</p>
      </div>
      <Tabs tabs={demoTabs} />
    </div>
  );
}

export { TabsDemo };