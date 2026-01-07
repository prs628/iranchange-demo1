"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
// PHASE 1: NextAuth disabled temporarily
// import { useSession } from "next-auth/react";
import { getSessionUser, isLoggedIn } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // PHASE 1: NextAuth disabled temporarily
  // const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  // Use localStorage auth instead
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Skip authentication check for login page
  // Handle both with and without basePath
  const isLoginPage = pathname?.endsWith("/admin/login") || pathname === "/admin/login" || pathname?.includes("/admin/login");

  // Mark as mounted on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // PHASE 1: Check localStorage auth instead of NextAuth
  // ساده‌سازی منطق: فقط روی mount و وقتی session_user_id در localStorage تغییر کند
  useEffect(() => {
    if (!isMounted || typeof window === "undefined") {
      return;
    }

    // Skip auth check if on login page
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }

    const runCheck = () => {
      try {
        const sessionUserId = localStorage.getItem("session_user_id");
        if (!sessionUserId) {
          setIsAuthenticated(false);
          setSessionUser(null);
          setIsChecking(false);
          return;
        }

        const user = getSessionUser();
        const loggedIn = isLoggedIn() && user?.role === "admin";

        setIsAuthenticated(loggedIn);
        setSessionUser(loggedIn ? user : null);
        setIsChecking(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsChecking(false);
      }
    };

    // چک اولیه
    runCheck();

    // واکنش به تغییرات localStorage (مثلاً لاگین/لاگ‌اوت در تب دیگر)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "session_user_id") {
        runCheck();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [isMounted, isLoginPage]);

  useEffect(() => {
    // If on login page, skip authentication check completely
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }

    // Wait for auth check to complete (only on client)
    if (typeof window === "undefined" || isChecking) {
      return;
    }

    // If not authenticated, redirect to admin login
    if (!isAuthenticated || !sessionUser) {
      router.push("/admin/login");
      return;
    }

    // If authenticated but not admin, redirect to dashboard
    if (sessionUser.role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, isChecking, sessionUser, isLoginPage, router, pathname]);

  // If on login page, render without admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth (only after mount)
  if (!isMounted || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render (redirect is happening)
  if (!isAuthenticated || !sessionUser || sessionUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">در حال هدایت...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-[280px] z-50 lg:hidden">
            <div className="h-full glass-panel rounded-l-2xl shadow-2xl overflow-hidden">
              <AdminSidebar onLinkClick={() => setSidebarOpen(false)} />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col lg:flex-row relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 relative">
          <div className="fixed right-0 top-0 bottom-0 w-64 glass-panel border-l border-white/10 z-20 overflow-y-auto">
            <AdminSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full lg:mr-64 min-h-screen relative">
          <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

