"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type MenuItem = {
  key: string;
  title: string;
  href?: string;
  icon?: string;
  badge?: string;
  children?: MenuItem[];
};

type SidebarItemProps = {
  item: MenuItem;
  level?: number;
  variant?: "dark" | "light";
  onLinkClick?: () => void;
};

export default function SidebarItem({ item, level = 0, variant = "dark", onLinkClick }: SidebarItemProps) {
  const isLight = variant === "light";
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href && pathname === item.href;
  const hasActiveChild = hasChildren && item.children?.some(child => child.href === pathname);
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setIsOpen(true);
      });
    }
  }, [hasActiveChild]);

  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      {hasChildren ? (
        <div>
          <button
            onClick={handleToggle}
            className={`w-full flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 text-right transition-colors ${
              isLight
                ? `hover:bg-slate-50 text-slate-700 ${hasActiveChild ? "bg-slate-50/50" : ""}`
                : `hover:bg-white/5 text-slate-200 ${hasActiveChild ? "bg-white/10" : ""}`
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <div
                  className={`w-4 h-4 rounded flex-shrink-0 ${
                    isLight ? "bg-slate-300" : "bg-white/20"
                  }`}
                />
              )}
              <span className={`text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                {item.title}
              </span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${
                isLight ? "text-slate-400" : "text-slate-500"
              } ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <div className={isLight ? "bg-slate-50/30" : "bg-white/5"}>
              {item.children?.map((child) => (
                <div key={child.key} className="pr-4">
                  <SidebarItem item={child} level={level + 1} variant={variant} onLinkClick={onLinkClick} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link
          href={item.href || "#"}
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 text-right transition-colors relative ${
            isLight
              ? `hover:bg-slate-50 ${
                  isActive
                    ? "bg-slate-900/5 text-slate-900 border-r-2 border-r-slate-900"
                    : "text-slate-700"
                }`
              : `hover:bg-white/5 text-slate-200 ${
                  isActive
                    ? "bg-white/10 text-white border-r-2 border-r-cyan-500"
                    : ""
                }`
          }`}
        >
          {item.icon && (
            <div
              className={`w-4 h-4 rounded flex-shrink-0 transition-colors ${
                isLight 
                  ? "bg-slate-300" 
                  : isActive 
                    ? "bg-cyan-500/30" 
                    : "bg-white/20"
              }`}
            />
          )}
          <span
            className={`text-sm font-medium flex-1 transition-colors ${
              isLight
                ? isActive
                  ? "text-slate-900 font-semibold"
                  : "text-slate-700"
                : isActive
                ? "text-white font-semibold"
                : "text-slate-200"
            }`}
          >
            {item.title}
          </span>
          {item.badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isLight 
                ? "bg-slate-200 text-slate-700" 
                : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
            }`}>
              {item.badge}
            </span>
          )}
        </Link>
      )}
    </div>
  );
}
