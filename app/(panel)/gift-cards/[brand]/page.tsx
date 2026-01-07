"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getGiftCardPricing, GiftCardAmountConfig } from "@/lib/giftCardPricing";
import { getAssetPath } from "@/lib/paths";

// اطلاعات گیفت کارت‌ها
const giftCardData: Record<string, {
  brand: string;
  logo: string;
  description: string;
  subtitle: string;
  amounts: { value: number; label: string; price: string }[];
  features: string[];
  instructions: string[];
}> = {
  playstation: {
    brand: "PlayStation",
    logo: "/brands/playstation.svg",
    subtitle: "گیفت کارت پلی استیشن",
    description: "گیفت کارت PlayStation برای خرید بازی، DLC، اشتراک PS Plus و محتوای دیجیتال از PlayStation Store",
    amounts: [
      { value: 10, label: "۱۰ دلار", price: "۵,۲۰۰,۰۰۰" },
      { value: 20, label: "۲۰ دلار", price: "۱۰,۴۰۰,۰۰۰" },
      { value: 50, label: "۵۰ دلار", price: "۲۶,۰۰۰,۰۰۰" },
      { value: 100, label: "۱۰۰ دلار", price: "۵۲,۰۰۰,۰۰۰" },
    ],
    features: [
      "قابل استفاده در PlayStation Store",
      "خرید بازی‌های دیجیتال",
      "خرید DLC و محتوای قابل دانلود",
      "خرید اشتراک PS Plus",
      "بدون تاریخ انقضا",
    ],
    instructions: [
      "کد گیفت کارت را دریافت کنید",
      "وارد PlayStation Store شوید",
      "به بخش Redeem Code بروید",
      "کد را وارد کنید و از خرید لذت ببرید",
    ],
  },
  fortnite: {
    brand: "Fortnite",
    logo: "/brands/fortnite.svg",
    subtitle: "وی‌باکس و آیتم",
    description: "وی‌باکس Fortnite برای خرید V-Bucks، پاس‌های فصل و آیتم‌های خاص",
    amounts: [
      { value: 10, label: "۱۰ دلار", price: "۵,۲۰۰,۰۰۰" },
      { value: 25, label: "۲۵ دلار", price: "۱۳,۰۰۰,۰۰۰" },
      { value: 50, label: "۵۰ دلار", price: "۲۶,۰۰۰,۰۰۰" },
      { value: 100, label: "۱۰۰ دلار", price: "۵۲,۰۰۰,۰۰۰" },
    ],
    features: [
      "خرید V-Bucks",
      "خرید پاس فصل",
      "خرید آیتم‌های خاص",
      "قابل استفاده در همه پلتفرم‌ها",
    ],
    instructions: [
      "کد را دریافت کنید",
      "وارد حساب Epic Games شوید",
      "کد را در بخش Redeem وارد کنید",
    ],
  },
  amazon: {
    brand: "Amazon",
    logo: "/brands/amazon.svg",
    subtitle: "خرید از آمازون",
    description: "گیفت کارت آمازون برای خرید از Amazon.com و Amazon Prime",
    amounts: [
      { value: 10, label: "۱۰ دلار", price: "۵,۲۰۰,۰۰۰" },
      { value: 25, label: "۲۵ دلار", price: "۱۳,۰۰۰,۰۰۰" },
      { value: 50, label: "۵۰ دلار", price: "۲۶,۰۰۰,۰۰۰" },
      { value: 100, label: "۱۰۰ دلار", price: "۵۲,۰۰۰,۰۰۰" },
    ],
    features: [
      "خرید از Amazon.com",
      "خرید اشتراک Prime",
      "بدون تاریخ انقضا",
      "قابل استفاده برای همه محصولات",
    ],
    instructions: [
      "کد را دریافت کنید",
      "وارد حساب Amazon شوید",
      "کد را در بخش Gift Cards وارد کنید",
    ],
  },
  netflix: {
    brand: "Netflix",
    logo: "/brands/netflix.svg",
    subtitle: "اشتراک نتفلیکس",
    description: "گیفت کارت Netflix برای خرید اشتراک ماهانه و سالانه",
    amounts: [
      { value: 15, label: "۱۵ دلار", price: "۷,۸۰۰,۰۰۰" },
      { value: 30, label: "۳۰ دلار", price: "۱۵,۶۰۰,۰۰۰" },
      { value: 60, label: "۶۰ دلار", price: "۳۱,۲۰۰,۰۰۰" },
    ],
    features: [
      "خرید اشتراک Netflix",
      "دسترسی به همه محتوا",
      "بدون نیاز به کارت بانکی",
      "قابل استفاده در همه کشورها",
    ],
    instructions: [
      "کد را دریافت کنید",
      "وارد حساب Netflix شوید",
      "کد را در بخش Redeem وارد کنید",
    ],
  },
  steam: {
    brand: "Steam",
    logo: "/brands/steam.svg",
    subtitle: "گیفت کارت استیم",
    description: "گیفت کارت Steam برای خرید بازی، DLC و آیتم‌های درون بازی",
    amounts: [
      { value: 10, label: "۱۰ دلار", price: "۵,۲۰۰,۰۰۰" },
      { value: 25, label: "۲۵ دلار", price: "۱۳,۰۰۰,۰۰۰" },
      { value: 50, label: "۵۰ دلار", price: "۲۶,۰۰۰,۰۰۰" },
      { value: 100, label: "۱۰۰ دلار", price: "۵۲,۰۰۰,۰۰۰" },
    ],
    features: [
      "خرید بازی از Steam",
      "خرید DLC و محتوای قابل دانلود",
      "خرید آیتم‌های درون بازی",
      "بدون تاریخ انقضا",
    ],
    instructions: [
      "کد را دریافت کنید",
      "وارد حساب Steam شوید",
      "کد را در بخش Redeem وارد کنید",
    ],
  },
  itunes: {
    brand: "iTunes",
    logo: "/brands/itunes.svg",
    subtitle: "آیتونز و اپ استور",
    description: "گیفت کارت iTunes و App Store برای خرید اپ، موزیک و محتوای دیجیتال",
    amounts: [
      { value: 10, label: "۱۰ دلار", price: "۵,۲۰۰,۰۰۰" },
      { value: 25, label: "۲۵ دلار", price: "۱۳,۰۰۰,۰۰۰" },
      { value: 50, label: "۵۰ دلار", price: "۲۶,۰۰۰,۰۰۰" },
      { value: 100, label: "۱۰۰ دلار", price: "۵۲,۰۰۰,۰۰۰" },
    ],
    features: [
      "خرید از App Store",
      "خرید موزیک از iTunes",
      "خرید اپ و بازی",
      "قابل استفاده در همه دستگاه‌های Apple",
    ],
    instructions: [
      "کد را دریافت کنید",
      "وارد حساب Apple ID شوید",
      "کد را در بخش Redeem وارد کنید",
    ],
  },
  "google-play": {
    brand: "Google Play",
    logo: "/brands/googleplay.svg",
    subtitle: "گوگل پلی",
    description: "گیفت کارت Google Play برای خرید اپ، بازی و محتوای دیجیتال",
    amounts: [
      { value: 10, label: "۱۰ دلار", price: "۵,۲۰۰,۰۰۰" },
      { value: 25, label: "۲۵ دلار", price: "۱۳,۰۰۰,۰۰۰" },
      { value: 50, label: "۵۰ دلار", price: "۲۶,۰۰۰,۰۰۰" },
      { value: 100, label: "۱۰۰ دلار", price: "۵۲,۰۰۰,۰۰۰" },
    ],
    features: [
      "خرید از Google Play Store",
      "خرید اپ و بازی",
      "خرید محتوای درون بازی",
      "قابل استفاده در Android",
    ],
    instructions: [
      "کد را دریافت کنید",
      "وارد حساب Google شوید",
      "کد را در بخش Redeem وارد کنید",
    ],
  },
  spotify: {
    brand: "Spotify",
    logo: "/brands/spotify.svg",
    subtitle: "اشتراک اسپاتیفای",
    description: "گیفت کارت Spotify برای خرید اشتراک Premium",
    amounts: [
      { value: 10, label: "۱۰ دلار", price: "۵,۲۰۰,۰۰۰" },
      { value: 30, label: "۳۰ دلار", price: "۱۵,۶۰۰,۰۰۰" },
      { value: 60, label: "۶۰ دلار", price: "۳۱,۲۰۰,۰۰۰" },
    ],
    features: [
      "خرید اشتراک Spotify Premium",
      "بدون آگهی",
      "دانلود موزیک",
      "کیفیت بالا",
    ],
    instructions: [
      "کد را دریافت کنید",
      "وارد حساب Spotify شوید",
      "کد را در بخش Redeem وارد کنید",
    ],
  },
  "flow-money": {
    brand: "فلیپ مانی",
    logo: "/brands/flip-money.png",
    subtitle: "فلیپ مانی",
    description: "گیفت کارت فلیپ مانی برای خرید و تراکنش‌های مختلف",
    amounts: [
      { value: 10, label: "۱۰ دلار", price: "۵,۲۰۰,۰۰۰" },
      { value: 25, label: "۲۵ دلار", price: "۱۳,۰۰۰,۰۰۰" },
      { value: 50, label: "۵۰ دلار", price: "۲۶,۰۰۰,۰۰۰" },
      { value: 100, label: "۱۰۰ دلار", price: "۵۲,۰۰۰,۰۰۰" },
    ],
    features: [
      "قابل استفاده در پلتفرم فلیپ مانی",
      "تراکنش‌های سریع و امن",
      "بدون تاریخ انقضا",
      "پشتیبانی 24/7",
    ],
    instructions: [
      "کد را دریافت کنید",
      "وارد حساب فلیپ مانی شوید",
      "کد را در بخش مربوطه وارد کنید",
      "از خدمات استفاده کنید",
    ],
  },
};

export default function GiftCardPurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn, openAuthModal } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [amountsFromAdmin, setAmountsFromAdmin] = useState<GiftCardAmountConfig[] | null>(null);

  const brandKey = params.brand as string;
  const cardData = giftCardData[brandKey];

  // بارگذاری قیمت‌ها از ادمین (localStorage)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pricing = getGiftCardPricing();
    if (pricing[brandKey]) {
      setAmountsFromAdmin(pricing[brandKey]);
    }
  }, [brandKey]);

  if (!cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">گیفت کارت پیدا نشد</h1>
          <Link href="/gift-cards" className="text-cyan-400 hover:text-cyan-300">
            بازگشت به لیست گیفت کارت‌ها
          </Link>
        </div>
      </div>
    );
  }

  const handlePurchase = () => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }

    if (!selectedAmount) {
      alert("لطفا مبلغ را انتخاب کنید");
      return;
    }

    // هدایت به صفحه checkout
    const params = new URLSearchParams({
      brand: brandKey,
      amount: selectedAmount.toString(),
      quantity: quantity.toString(),
      totalPrice: totalPrice,
    });
    router.push(`/checkout?${params.toString()}`);
  };

  const effectiveAmounts = (amountsFromAdmin
    ? amountsFromAdmin.map((cfg) => ({
        value: cfg.valueUsd,
        label: cfg.label,
        price: cfg.priceToman.toLocaleString("fa-IR"),
      }))
    : cardData.amounts);

  const selectedAmountData = effectiveAmounts.find(
    (a) => a.value === selectedAmount
  );

  const totalPrice = selectedAmountData
    ? (
        parseInt(selectedAmountData.price.replace(/,/g, "")) * quantity
      ).toLocaleString("fa-IR")
    : "۰";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/gift-cards"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          بازگشت به لیست گیفت کارت‌ها
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Header */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden p-4">
                  <img
                    src={getAssetPath(cardData.logo)}
                    alt={cardData.brand}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
                    {cardData.brand}
                  </h1>
                  <p className="text-slate-400 mb-3">{cardData.subtitle}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {cardData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                انتخاب مبلغ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {effectiveAmounts.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => setSelectedAmount(amount.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedAmount === amount.value
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="text-lg font-semibold text-slate-100 mb-1">
                      {amount.label}
                    </div>
                    <div className="text-sm text-slate-400">
                      {amount.price} تومان
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            {selectedAmount && (
              <div className="glass-panel rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-4">
                  تعداد
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-2xl font-semibold text-slate-100 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-slate-400 mr-auto">
                    عدد گیفت کارت
                  </span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                ویژگی‌ها
              </h2>
              <ul className="space-y-2">
                {cardData.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                نحوه استفاده
              </h2>
              <ol className="space-y-3">
                {cardData.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-300">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: Purchase Card */}
          <div className="lg:col-span-1">
            <div className="glass-panel rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">
                خلاصه سفارش
              </h2>

              {selectedAmount ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">مبلغ:</span>
                      <span className="text-slate-200 font-medium">
                        {selectedAmountData?.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">تعداد:</span>
                      <span className="text-slate-200 font-medium">{quantity} عدد</span>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">جمع کل:</span>
                        <span className="text-2xl font-bold text-slate-100">
                          {totalPrice} تومان
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePurchase}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                  >
                    خرید و پرداخت
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400 mb-4">
                    لطفا مبلغ را انتخاب کنید
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <span>⚡</span>
                  <span>تحویل فوری و آنی</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <span>✓</span>
                  <span>کد معتبر و قابل استفاده</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <span>💬</span>
                  <span>پشتیبانی 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

