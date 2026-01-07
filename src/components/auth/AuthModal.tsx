"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { login, register } from "@/lib/auth";

// Fixed mobile scroll issue: modal content now scrolls independently from page

type TabType = "login" | "register";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
};

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
}: AuthModalProps) {
  const { closeAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Close on Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    // Prevent scroll on backdrop - only allow scroll inside modal content
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Check if touch is inside the scrollable modal content
      const scrollableContent = target.closest('.overflow-y-auto');
      
      // If not inside scrollable content, prevent scroll
      if (!scrollableContent) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      
      // Prevent body scroll on mobile
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      const originalTop = document.body.style.top;
      const originalOverscroll = document.body.style.overscrollBehavior;
      
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overscrollBehavior = "none";
      
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("touchmove", handleTouchMove);
        
        // Restore body styles
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
        document.body.style.top = originalTop;
        document.body.style.overscrollBehavior = originalOverscroll;
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    if (!identifier || !password) {
      setError("لطفاً تمام فیلدها را پر کنید");
      setIsLoading(false);
      return;
    }

    if (typeof window === "undefined") {
      setError("خطا: localStorage در دسترس نیست");
      setIsLoading(false);
      return;
    }

    try {
      // Login user using real function
      const result = await login(identifier.trim(), password);

      if (!result.success) {
        setError(result.error || "ایمیل/شماره تلفن یا رمز عبور اشتباه است");
        setIsLoading(false);
        return;
      }

      // Login successful - close modal and refresh
      closeAuthModal();
      
      // Redirect based on role
      // Admin users should use /admin/login page, not from main site
      if (result.user?.role === "admin") {
        // Show message that admin should use admin panel
        alert("برای دسترسی به پنل ادمین، لطفاً از آدرس /admin/login وارد شوید");
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("خطا در ورود. لطفاً دوباره تلاش کنید.");
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setError("لطفاً تمام فیلدها را پر کنید");
      setIsLoading(false);
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName.length < 2) {
      setError("نام باید حداقل ۲ کاراکتر باشد");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      setIsLoading(false);
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      setIsLoading(false);
      return;
    }

    if (typeof window === "undefined") {
      setError("خطا: localStorage در دسترس نیست");
      setIsLoading(false);
      return;
    }

    try {
      // Register user using real function
      const result = await register(
        fullName,
        email.trim(),
        phone.trim(),
        password
      );

      if (!result.success) {
        setError(result.error || "خطا در ثبت نام");
        setIsLoading(false);
        return;
      }

      // Registration successful - Auto login the user
      if (result.user && typeof window !== "undefined") {
        // Set session
        localStorage.setItem("session_user_id", result.user.id.toString());
        localStorage.setItem("user_email", result.user.email);
        localStorage.setItem("user_phone", result.user.phone);
        localStorage.setItem("user_name", result.user.name);
        
        // Notify admin panel
        window.dispatchEvent(new CustomEvent("usersUpdated"));
        
        // Close modal
        closeAuthModal();
        
        // Redirect based on role
        if (result.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("خطا در ثبت نام. لطفاً دوباره تلاش کنید.");
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ overscrollBehavior: 'none' }}
    >
      {/* Backdrop - clickable to close */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md max-h-[90vh] glass-card rounded-2xl shadow-2xl animate-in zoom-in duration-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Fixed position outside scrollable area */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          aria-label="بستن"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        {/* Scrollable content container */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-8 pt-12 pb-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "login"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ورود
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError("");
            }}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "register"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ثبت نام
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">ورود</h2>
              <p className="text-sm text-gray-400">
                به حساب کاربری خود وارد شوید
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                شماره موبایل یا ایمیل
              </label>
              <input
                id="login-email"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="09123456789 یا example@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                رمز عبور
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/50"
              />
              <label htmlFor="remember" className="text-sm text-gray-400">
                مرا به خاطر بسپار
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">ثبت نام</h2>
              <p className="text-sm text-gray-400">
                حساب کاربری جدید ایجاد کنید
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-first-name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  نام
                </label>
                <input
                  id="register-first-name"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="نام"
                />
              </div>
              <div>
                <label
                  htmlFor="register-last-name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  نام خانوادگی
                </label>
                <input
                  id="register-last-name"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="نام خانوادگی"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:order-1">
                <label
                  htmlFor="register-phone"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  شماره موبایل
                </label>
                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="09123456789"
                />
              </div>

              <div className="md:order-2">
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                ایمیل
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="example@email.com"
              />
            </div>
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                رمز عبور
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="حداقل ۶ کاراکتر"
              />
            </div>

            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                تکرار رمز عبور
              </label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="رمز عبور را تکرار کنید"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "در حال ثبت نام..." : "ثبت نام"}
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}

