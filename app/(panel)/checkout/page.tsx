"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

// تابع helper برای parse کردن اعداد فارسی و انگلیسی با کاما
function parseNumber(str: string | null): number {
  if (!str) return 0;
  // تبدیل اعداد فارسی به انگلیسی
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";
  let persianToEnglish = str.toString();
  for (let i = 0; i < persianDigits.length; i++) {
    persianToEnglish = persianToEnglish.replace(new RegExp(persianDigits[i], "g"), englishDigits[i]);
  }
  // حذف کاما و فاصله و کاراکترهای غیر عددی
  const cleaned = persianToEnglish.replace(/,/g, "").replace(/\s/g, "").replace(/[^\d]/g, "").trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<{
    type: "gift-card" | "crypto";
    brand?: string;
    symbol?: string;
    name?: string;
    amount: number;
    quantity: number;
    totalPrice: string;
    amountType?: "usd" | "crypto";
    valueUsd?: number; // ارزش دلاری کارت (برای گیفت کارت‌ها)
  } | null>(null);

  // دریافت اطلاعات سفارش از query params (بدون وابستگی به isLoggedIn)
  useEffect(() => {
    const type = searchParams.get("type");
    const brand = searchParams.get("brand");
    const symbol = searchParams.get("symbol");
    const name = searchParams.get("name");
    const amount = searchParams.get("amount");
    const amountType = searchParams.get("amountType") as "usd" | "crypto" | null;

    // بررسی نوع سفارش
    if (type === "crypto") {
      // برای ارز دیجیتال
      if (!symbol || !name || !amount) {
        router.push("/crypto/buy");
        return;
      }
      setOrderData({
        type: "crypto",
        symbol,
        name,
        amount: parseFloat(amount),
        quantity: 1, // برای ارز دیجیتال همیشه 1
        totalPrice: amount, // قیمت همان مبلغ است
        amountType: amountType || "usd",
      });
    } else if (type === "card" || type === "paypal") {
      // برای کارت یا پی پال
      const cardType = searchParams.get("cardType");
      const plan = searchParams.get("plan");
      const quantity = searchParams.get("quantity");
      const price = searchParams.get("price");
      const totalPrice = searchParams.get("totalPrice");
      
      if (type === "card" && cardType && quantity && totalPrice) {
        const qty = parseInt(quantity, 10) || 1;
        // parse کردن totalPrice و price - استفاده از parseNumber برای پشتیبانی از اعداد فارسی و انگلیسی
        const total = parseNumber(totalPrice);
        const priceValue = price ? parseNumber(price) : 0;
        // محاسبه قیمت هر کارت - اول از price استفاده می‌کنیم، اگر نبود از totalPrice محاسبه می‌کنیم
        let pricePerCard = 0;
        if (priceValue > 0) {
          pricePerCard = priceValue;
        } else if (qty > 0 && total > 0) {
          pricePerCard = Math.floor(total / qty);
        }
        
        setOrderData({
          type: "gift-card", // استفاده از gift-card برای نمایش
          brand: cardType,
          amount: pricePerCard,
          quantity: qty,
          totalPrice: total.toString(),
        });
      } else if (type === "paypal" && plan && totalPrice) {
        setOrderData({
          type: "gift-card", // استفاده از gift-card برای نمایش
          brand: `paypal-${plan}`,
          amount: parseInt(totalPrice),
          quantity: 1,
          totalPrice: totalPrice,
        });
      }
    } else {
      // برای گیفت کارت (پیش‌فرض)
      const quantity = searchParams.get("quantity");
      if (!brand || !amount || !quantity) {
        router.push("/gift-cards");
        return;
      }
      // amount در اینجا ارزش دلاری کارت است (valueUsd)
      const valueUsd = amount ? parseInt(amount) : undefined;
      const totalPriceStr = searchParams.get("totalPrice") || "0";
      // محاسبه قیمت هر کارت از totalPrice
      const totalPriceNum = parseNumber(totalPriceStr);
      const quantityNum = parseInt(quantity) || 1;
      const pricePerCard = quantityNum > 0 ? Math.floor(totalPriceNum / quantityNum) : 0;
      
      setOrderData({
        type: "gift-card",
        brand,
        amount: pricePerCard, // قیمت هر کارت به تومان
        quantity: quantityNum,
        totalPrice: totalPriceNum > 0 ? totalPriceNum.toString() : totalPriceStr, // ذخیره به صورت عددی
        valueUsd: valueUsd, // ارزش دلاری کارت (حتی اگر 0 باشد)
      });
    }
  }, [searchParams, router]);

  // چک کردن لاگین فقط یک بار و فقط اگر لاگین نیستی، مودال را باز کن
  useEffect(() => {
    if (!isLoggedIn) {
      // فقط یک بار مودال را باز کن
      const timer = setTimeout(() => {
        openAuthModal();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, openAuthModal]);

  const handlePayment = async () => {
    if (!orderData) return;

    setLoading(true);

    try {
      // ایجاد تراکنش و دریافت لینک درگاه
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: orderData.type,
          brand: orderData.brand,
          symbol: orderData.symbol,
          name: orderData.name,
          amount: orderData.amount,
          quantity: orderData.quantity,
          totalPrice: orderData.totalPrice,
          amountType: orderData.amountType,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // هدایت به درگاه پرداخت
        window.location.href = data.paymentUrl;
      } else {
        alert("خطا در ایجاد تراکنش. لطفا دوباره تلاش کنید.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("خطا در اتصال به درگاه پرداخت");
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={orderData.type === "crypto" ? "/crypto/buy" : "/gift-cards"}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            بازگشت
          </Link>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">تایید و پرداخت</h1>
          <p className="text-slate-400">لطفا اطلاعات سفارش را بررسی کنید</p>
        </div>

        {/* Order Summary */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">خلاصه سفارش</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-slate-400">محصول:</span>
              <span className="text-slate-200 font-medium">
                {orderData.type === "crypto" 
                  ? `${orderData.name} (${orderData.symbol})`
                  : `گیفت کارت ${orderData.brand}`
                }
              </span>
            </div>
            {orderData.brand?.startsWith("paypal-") ? (
              // برای پی پال، مبلغ را نمایش نده (چون totalPrice همان مبلغ است)
              null
            ) : (
              <>
                {orderData.type === "gift-card" && orderData.valueUsd !== undefined && orderData.valueUsd > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-slate-400">ارزش کارت:</span>
                    <span className="text-slate-200 font-medium">
                      {orderData.valueUsd.toLocaleString("fa-IR")} دلار
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-slate-400">
                    {orderData.type === "crypto" ? "مبلغ خرید:" : "قیمت هر کارت:"}
                  </span>
                  <span className="text-slate-200 font-medium">
                    {orderData.type === "crypto" ? (
                      // برای ارز دیجیتال
                      <>
                        {orderData.amount.toLocaleString("fa-IR")}{" "}
                        {orderData.amountType === "usd" ? "دلار" : orderData.symbol}
                      </>
                    ) : (
                      // برای کارت‌ها و گیفت کارت‌ها
                      <>
                        {(() => {
                          // اول سعی می‌کنیم از amount استفاده کنیم
                          if (orderData.amount && orderData.amount > 0) {
                            return `${orderData.amount.toLocaleString("fa-IR")} تومان`;
                          }
                          // اگر amount صفر یا undefined است، از totalPrice محاسبه می‌کنیم
                          const totalPriceNum = typeof orderData.totalPrice === "string" 
                            ? parseNumber(orderData.totalPrice) 
                            : (Number(orderData.totalPrice) || 0);
                          
                          if (orderData.quantity > 0 && totalPriceNum > 0) {
                            const pricePerCard = Math.floor(totalPriceNum / orderData.quantity);
                            if (pricePerCard > 0) {
                              return `${pricePerCard.toLocaleString("fa-IR")} تومان`;
                            }
                          }
                          return "—";
                        })()}
                      </>
                    )}
                  </span>
                </div>
                {orderData.type === "gift-card" && (
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-slate-400">تعداد:</span>
                    <span className="text-slate-200 font-medium">{orderData.quantity} عدد</span>
                  </div>
                )}
              </>
            )}
            <div className="pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg text-slate-300 font-medium">مبلغ قابل پرداخت:</span>
                <span className="text-3xl font-bold text-slate-100">
                  {orderData.type === "crypto" ? (
                    `${orderData.amount.toLocaleString("fa-IR")} ${orderData.amountType === "usd" ? "دلار" : orderData.symbol}`
                  ) : (
                    (() => {
                      // اگر totalPrice عددی است، مستقیماً استفاده می‌کنیم
                      let total: number;
                      if (typeof orderData.totalPrice === "string") {
                        total = parseNumber(orderData.totalPrice);
                      } else {
                        total = Number(orderData.totalPrice) || 0;
                      }
                      return total > 0 
                        ? `${total.toLocaleString("fa-IR")} تومان`
                        : "— تومان";
                    })()
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">انتخاب روش پرداخت</h2>
          
          <div className="mb-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-cyan-400 text-xl">💳</span>
                </div>
                <div>
                  <p className="text-slate-200 font-medium">درگاه پرداخت</p>
                  <p className="text-xs text-slate-400">پرداخت امن و سریع</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال اتصال به درگاه...
              </span>
            ) : (
              "ادامه به درگاه پرداخت"
            )}
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            با کلیک روی دکمه بالا، به صفحه پرداخت امن هدایت می‌شوید
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-6 glass-panel rounded-2xl p-6">
          <div className="flex items-start gap-3 text-sm text-slate-400">
            <span>🔒</span>
            <p>
              تمامی تراکنش‌ها به صورت امن و رمزگذاری شده انجام می‌شود. 
              اطلاعات کارت بانکی شما نزد ما ذخیره نمی‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

