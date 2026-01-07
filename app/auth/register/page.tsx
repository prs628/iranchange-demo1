"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// PHASE 1: NextAuth disabled – use localStorage-based auth instead
import { register } from "@/lib/auth";

export default function RegisterPage() {
  // Prevent body and html scroll when this page is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    // Save original overflow values
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyPosition = body.style.position;
    const originalBodyWidth = body.style.width;
    
    // Disable scroll on html and body
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.width = '100%';
    
    return () => {
      // Restore original values
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
      body.style.position = originalBodyPosition;
      body.style.width = originalBodyWidth;
    };
  }, []);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);

  const checkPasswordStrength = (password: string): "weak" | "medium" | "strong" => {
    if (password.length < 6) return "weak";
    if (password.length < 8) return "medium";
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (strength >= 3) return "strong";
    if (strength >= 2) return "medium";
    return "weak";
  };

  const handlePasswordChange = (password: string) => {
    if (password.length > 0) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    const acceptTerms = formData.get("acceptTerms") === "on";

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

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("لطفاً با قوانین و مقررات موافقت کنید");
      setIsLoading(false);
      return;
    }

    try {
      // PHASE 1: Register user in localStorage (no server call)
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

      // Registration successful – redirect to login with success message
      router.push("/auth/login?registered=true");
    } catch (err) {
      console.error("Registration error:", err);
      setError("خطا در ثبت نام. لطفاً دوباره تلاش کنید.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8 min-h-screen flex items-start justify-center">
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-600 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ثبت نام</h1>
            <p className="text-sm text-gray-400">
              حساب کاربری جدید ایجاد کنید
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  نام
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="نام"
                  onFocus={(e) => {
                    // Scroll input into view on mobile
                    setTimeout(() => {
                      const submitBtn = document.getElementById('register-submit-btn');
                      if (submitBtn) {
                        submitBtn.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                      } else {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                      }
                    }, 100);
                  }}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  نام خانوادگی
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="نام خانوادگی"
                  onFocus={(e) => {
                    setTimeout(() => {
                      const submitBtn = document.getElementById('register-submit-btn');
                      if (submitBtn) {
                        submitBtn.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                      } else {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                      }
                    }, 100);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:order-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  شماره تلفن
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="09123456789"
                  onFocus={(e) => {
                    setTimeout(() => {
                      const submitBtn = document.getElementById('register-submit-btn');
                      if (submitBtn) {
                        submitBtn.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                      } else {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                      }
                    }, 100);
                  }}
                />
              </div>

              <div className="md:order-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                ایمیل
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="example@email.com"
                onFocus={(e) => {
                  setTimeout(() => {
                    const submitBtn = document.getElementById('register-submit-btn');
                    if (submitBtn) {
                      submitBtn.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                    } else {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }
                  }, 100);
                }}
              />
            </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="حداقل ۸ کاراکتر"
                onFocus={(e) => {
                  setTimeout(() => {
                    const submitBtn = document.getElementById('register-submit-btn');
                    if (submitBtn) {
                      submitBtn.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                    } else {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }
                  }, 100);
                }}
              />
              {passwordStrength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength === "weak"
                          ? "w-1/3 bg-red-500"
                          : passwordStrength === "medium"
                          ? "w-2/3 bg-yellow-500"
                          : "w-full bg-green-500"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {passwordStrength === "weak"
                      ? "ضعیف"
                      : passwordStrength === "medium"
                      ? "متوسط"
                      : "قوی"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                تکرار رمز عبور
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="رمز عبور را دوباره وارد کنید"
                onFocus={(e) => {
                  setTimeout(() => {
                    const submitBtn = document.getElementById('register-submit-btn');
                    if (submitBtn) {
                      submitBtn.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                    } else {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }
                  }, 300);
                }}
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                disabled={isLoading}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-400">
                با{" "}
                <Link href="/terms" className="text-green-400 hover:text-green-300">
                  قوانین و مقررات
                </Link>{" "}
                موافقم
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="register-submit-btn"
              className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "در حال ثبت نام..." : "ثبت نام"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              قبلاً ثبت نام کرده‌اید؟{" "}
              <Link href="/auth/login" className="text-green-400 hover:text-green-300 font-medium">
                وارد شوید
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
