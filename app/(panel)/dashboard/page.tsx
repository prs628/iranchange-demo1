"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import StatusPill from "@/components/dashboard/StatusPill";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSessionUser } from "@/lib/auth";

// Fixed TypeScript errors: onClick handlers now properly wrap openAuthModal

// Fake data
const recentOrders = [
  {
    id: "ORD-2024-001",
    service: "ویزا کارت مجازی",
    amount: "۵,۰۰۰,۰۰۰",
    status: "processing" as const,
    date: "۱۴۰۳/۰۹/۱۵",
  },
  {
    id: "ORD-2024-002",
    service: "گیفت کارت آمازون",
    amount: "۲,۵۰۰,۰۰۰",
    status: "done" as const,
    date: "۱۴۰۳/۰۹/۱۴",
  },
  {
    id: "ORD-2024-003",
    service: "پرداخت خارجی",
    amount: "۱۰,۰۰۰,۰۰۰",
    status: "pending" as const,
    date: "۱۴۰۳/۰۹/۱۳",
  },
  {
    id: "ORD-2024-004",
    service: "تریدینگ ویو",
    amount: "۱,۲۰۰,۰۰۰",
    status: "failed" as const,
    date: "۱۴۰۳/۰۹/۱۲",
  },
];

const notifications = [
  {
    id: 1,
    title: "سفارش شما تکمیل شد",
    time: "۲ ساعت پیش",
    read: false,
  },
  {
    id: 2,
    title: "پرداخت موفقیت‌آمیز بود",
    time: "۵ ساعت پیش",
    read: false,
  },
  {
    id: 3,
    title: "تیکت جدید پاسخ داده شد",
    time: "۱ روز پیش",
    read: true,
  },
];

const statusLabels = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  done: "تکمیل شده",
  failed: "ناموفق",
};

export default function DashboardPage() {
  const { isLoggedIn, openAuthModal } = useAuth();
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

  return (
    <DashboardShell>
      <div className="p-6 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {isLoggedIn && userName ? `خوش آمدید ${userName}` : "داشبورد"}
            </h1>
            <p className="text-sm text-gray-400">خلاصه وضعیت حساب</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="جستجو در سرویس‌ها…"
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25">
              ایجاد سفارش
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoggedIn ? (
            <StatCard
              title="موجودی کیف پول"
              value="۱۲,۵۰۰,۰۰۰"
              trend="+۲.۴% این هفته"
              icon={
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          ) : (
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">موجودی کیف پول</p>
                  <p className="text-sm text-gray-400 mt-2">
                    برای مشاهده موجودی وارد شوید
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
          {isLoggedIn ? (
            <>
              <StatCard
                title="سفارش‌های فعال"
                value="۸"
                trend="+۳ سفارش جدید"
                icon={
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
              <StatCard
                title="تراکنش‌های امروز"
                value="۲۴"
                trend="+۱۲% نسبت به دیروز"
                icon={
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
              />
            </>
          ) : (
            <>
              <StatCard
                title="سفارش‌های فعال"
                value="—"
                icon={
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
              <StatCard
                title="تراکنش‌های امروز"
                value="—"
                icon={
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
              />
            </>
          )}
          <StatCard
            title="تیکت‌های باز"
            value={isLoggedIn ? "۳" : "—"}
            trend={isLoggedIn ? "۲ تیکت جدید" : undefined}
            icon={
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="شارژ کیف پول"
            href="/wallet/charge"
            description="افزایش موجودی"
            icon={
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          />
          <QuickActionCard
            title="پیگیری سفارش"
            href="/orders/track"
            description="وضعیت سفارشات"
            icon={
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            }
          />
          <QuickActionCard
            title="پرداخت خارجی"
            href="/international-payments"
            description="پرداخت بین‌المللی"
            icon={
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
          />
          <QuickActionCard
            title="پشتیبانی"
            href="/support/tickets"
            description="ارسال تیکت"
            icon={
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recent Orders Table */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">سفارش‌های اخیر</h2>
              {isLoggedIn && (
                <Link
                  href="/orders/track"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  مشاهده همه
                </Link>
              )}
            </div>
            {isLoggedIn ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                        شماره سفارش
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                        سرویس
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                        مبلغ
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                        وضعیت
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                        تاریخ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4 text-sm text-white font-mono">
                          {order.id}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-300">
                          {order.service}
                        </td>
                        <td className="py-4 px-4 text-sm text-white font-medium">
                          {order.amount} تومان
                        </td>
                        <td className="py-4 px-4">
                          <StatusPill status={order.status}>
                            {statusLabels[order.status]}
                          </StatusPill>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-400">
                          {order.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-400 mb-4">
                  برای مشاهده سفارش‌های خود وارد شوید
                </p>
                <button
                  onClick={() => openAuthModal("login")}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  ورود / ثبت‌نام
                </button>
              </div>
            )}
          </div>

          {/* Right: Notifications & Security */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">اعلان‌ها</h2>
              {isLoggedIn ? (
                <>
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border ${
                          notif.read
                            ? "bg-white/5 border-white/5"
                            : "bg-blue-500/10 border-blue-500/20"
                        }`}
                      >
                        <p className="text-sm text-white font-medium mb-1">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/notifications"
                    className="block mt-4 text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    مشاهده همه اعلان‌ها
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-4">
                    برای مشاهده اعلان‌ها وارد شوید
                  </p>
                  <button
                    onClick={() => openAuthModal("login")}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm"
                  >
                    ورود / ثبت‌نام
                  </button>
                </div>
              )}
            </div>

            {/* Security Card */}
            {isLoggedIn && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">امنیت حساب</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium mb-1">
                        احراز هویت دو مرحله‌ای
                      </p>
                      <p className="text-xs text-gray-400">غیرفعال</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors">
                      فعال‌سازی
                    </button>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">آخرین ورود:</p>
                    <p className="text-sm text-white">۱۴۰۳/۰۹/۱۵ - ۱۴:۳۰</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      💡 برای امنیت بیشتر، رمز عبور قوی انتخاب کنید و احراز هویت
                      دو مرحله‌ای را فعال کنید.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
