"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSessionUser } from "@/lib/auth";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, logoutDemo, openAuthModal } = useAuth();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadUserName = () => {
      if (isLoggedIn) {
        const sessionUser = getSessionUser();
        if (sessionUser && sessionUser.name) {
          setUserName(sessionUser.name);
        } else {
          setUserName("");
        }
      } else {
        setUserName("");
      }
    };
    
    loadUserName();
    
    // بررسی تغییرات هر 500ms
    const interval = setInterval(loadUserName, 500);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogout = () => {
    logoutDemo();
    // Clear session
    if (typeof window !== "undefined") {
      localStorage.removeItem("session_user_id");
    }
    router.refresh();
  };

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "داشبورد";
    if (pathname.includes("/discounts")) return "تخفیفی";
    if (pathname.includes("/crypto")) return "ارز دیجیتال";
    if (pathname.includes("/cards")) return "کارت‌ها";
    if (pathname.includes("/gift-cards")) return "گیفت کارت‌ها";
    if (pathname.includes("/international-payments")) return "پرداخت خارجی";
    if (pathname.includes("/buy-deliver-iran")) return "خرید و تحویل";
    if (pathname.includes("/paypal")) return "پی پال";
    if (pathname.includes("/services")) return "سرویس‌ها";
    if (pathname.includes("/orders")) return "سفارش‌ها";
    if (pathname.includes("/support")) return "پشتیبانی";
    return "داشبورد";
  };

  return (
    <>
      <div className="w-full bg-white/5 backdrop-blur-sm border-b border-white/10 px-2 sm:px-6 py-3.5 sm:py-4.5">
        <div className="flex items-center justify-between gap-1 sm:gap-4">
          {/* Right: Logo + Page Title */}
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink min-w-0">
            <Link href="/" className="flex items-center gap-1 sm:gap-2 flex-none shrink-0">
              <div className="h-6 sm:h-10 w-20 sm:w-40 overflow-hidden flex-none shrink-0">
                <img
                  src="/log/iranchange-logo.png"
                  alt="Iranchange"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <h1 className="text-[10px] sm:text-lg font-bold text-white truncate hidden xs:block">{getPageTitle()}</h1>
          </div>

          {/* Center: Search (optional) */}
          <div className="flex-1 max-w-md hidden md:block">
            <input
              type="text"
              placeholder="جستجو در سرویس‌ها…"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>

          {/* Top-Left: Auth Button */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-300 hidden sm:inline">{userName || "کاربر"}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all"
                >
                  خروج
                </button>
              </>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-700 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 text-[11px] sm:text-sm whitespace-nowrap flex-shrink-0 min-w-fit"
              >
                <span className="sm:hidden">🔥 تست تغییر</span>
                <span className="hidden sm:inline">ورود / ثبت‌نام</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

