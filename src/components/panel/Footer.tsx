"use client";

import Link from "next/link";
import { getAssetPath } from "@/lib/paths";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        {/* Top row: brand + links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="text-slate-400">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/" className="flex items-center gap-2 flex-none shrink-0">
                <div className="h-8 sm:h-10 w-36 sm:w-40 overflow-hidden flex-none shrink-0">
                  <img
                    src={getAssetPath("/log/iranchange-logo.png")}
                    alt="Iranchange"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            </div>
            <p className="text-[11px] sm:text-xs leading-relaxed max-w-md">
              پلتفرم یکپارچه برای خرید گیفت کارت، کارت‌های اعتباری بین‌المللی و انجام پرداخت‌های ارزی،
              با تمرکز روی تجربه کاربری ساده و شفاف.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400">
            <Link
              href="/about"
              className="hover:text-slate-100 transition-colors text-xs sm:text-sm"
            >
              درباره ما
            </Link>
            <Link
              href="/support/tickets"
              className="hover:text-slate-100 transition-colors text-xs sm:text-sm"
            >
              پشتیبانی
            </Link>
            <Link
              href="/orders/track"
              className="hover:text-slate-100 transition-colors text-xs sm:text-sm"
            >
              پیگیری سفارش
            </Link>
          </div>
        </div>

        {/* Bottom row: social + copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/5 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[11px] sm:text-xs text-slate-400">
            <span className="text-slate-500 whitespace-nowrap">ما را در شبکه‌های اجتماعی دنبال کنید:</span>
            <div className="flex items-center gap-2">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs hover:bg-pink-500/20 hover:border-pink-400/50 hover:text-pink-300 transition-all hover:scale-105"
              >
                <img
                  src={getAssetPath("/icon/instagram.png")}
                  alt="Instagram"
                  className="w-5 h-5 object-contain"
                />
                <span className="whitespace-nowrap">اینستاگرام</span>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-all hover:scale-105"
              >
                <img
                  src={getAssetPath("/icon/telegram.png")}
                  alt="Telegram"
                  className="w-5 h-5 object-contain"
                />
                <span className="whitespace-nowrap">تلگرام</span>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs hover:bg-slate-500/20 hover:border-slate-300/50 hover:text-slate-100 transition-all hover:scale-105"
              >
                <img
                  src={getAssetPath("/icon/twitter.png")}
                  alt="Twitter / X"
                  className="w-5 h-5 object-contain"
                />
                <span className="whitespace-nowrap">توییتر</span>
              </a>
            </div>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 text-left sm:text-right">
            © {year} Iranchange. تمامی حقوق این وب‌سایت محفوظ است.
          </div>
        </div>
      </div>
    </footer>
  );
}


