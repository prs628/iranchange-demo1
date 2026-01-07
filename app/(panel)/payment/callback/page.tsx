"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderData, setOrderData] = useState<any>(null);
  const [giftCodes, setGiftCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    // دریافت پارامترهای بازگشت از درگاه
    const authority = searchParams.get("Authority") || searchParams.get("authority");
    const status = searchParams.get("Status") || searchParams.get("status");
    const orderId = searchParams.get("orderId");

    // بررسی وضعیت پرداخت
    verifyPayment(authority, status, orderId);
  }, [searchParams, isLoggedIn, router]);

  const verifyPayment = async (authority: string | null, status: string | null, orderId: string | null) => {
    try {
      // ارسال درخواست به API برای تایید پرداخت
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authority,
          status,
          orderId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setOrderData(data.order);
        setGiftCodes(data.giftCodes || []);
      } else {
        setStatus("failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("failed");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">در حال بررسی پرداخت...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">پرداخت موفقیت‌آمیز بود!</h1>
            <p className="text-slate-400">کدهای گیفت کارت شما آماده است</p>
          </div>

          {/* Gift Codes */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">کدهای گیفت کارت</h2>
            
            <div className="space-y-4">
              {giftCodes.map((code, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">کد {index + 1}:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        alert("کد کپی شد!");
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      کپی
                    </button>
                  </div>
                  <div className="font-mono text-lg font-semibold text-slate-100 text-center py-2 bg-slate-900/50 rounded-lg">
                    {code}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-300">
                ⚠️ لطفا کدها را در جای امنی ذخیره کنید. این کدها فقط یک بار نمایش داده می‌شوند.
              </p>
            </div>
          </div>

          {/* Order Info */}
          {orderData && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">اطلاعات سفارش</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">محصول:</span>
                  <span className="text-slate-200">گیفت کارت {orderData.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">مبلغ:</span>
                  <span className="text-slate-200">{orderData.totalPrice} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">شماره سفارش:</span>
                  <span className="text-slate-200 font-mono">{orderData.orderId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-center"
            >
              بازگشت به داشبورد
            </Link>
            <Link
              href="/gift-cards"
              className="flex-1 px-6 py-3 bg-white/5 text-slate-200 font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all text-center"
            >
              خرید بیشتر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Failed
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">پرداخت ناموفق بود</h1>
          <p className="text-slate-400">متاسفانه پرداخت شما انجام نشد</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6">
          <p className="text-slate-300 mb-4">
            ممکن است به دلایل زیر پرداخت انجام نشده باشد:
          </p>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li>• موجودی حساب کافی نبود</li>
            <li>• اطلاعات کارت بانکی صحیح نبود</li>
            <li>• تراکنش توسط بانک رد شد</li>
            <li>• خطا در اتصال به درگاه پرداخت</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            تلاش مجدد
          </button>
          <Link
            href="/gift-cards"
            className="flex-1 px-6 py-3 bg-white/5 text-slate-200 font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all text-center"
          >
            بازگشت به لیست
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

