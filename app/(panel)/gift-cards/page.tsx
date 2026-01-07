"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";
// PHASE 1: NextAuth disabled temporarily
// import { useSession } from "next-auth/react";
import { getUsers } from "@/lib/auth";
import { getAssetPath } from "@/lib/paths";

type GiftCard = {
  id: number;
  brand: string;
  brandKey: string;
  logo: string;
  subtitle: string;
  description?: string;
  showByDefault: boolean;
};

export default function GiftCardsPage() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);

  useEffect(() => {
    // داده‌های پیش‌فرض کامل
    const defaultCards: GiftCard[] = [
      { id: 1, brand: "PlayStation", brandKey: "playstation", logo: "/brands/playstation.svg", subtitle: "گیفت کارت پلی استیشن", description: "گیفت کارت PlayStation برای خرید بازی، DLC و اشتراک PS Plus", showByDefault: true },
      { id: 2, brand: "Fortnite", brandKey: "fortnite", logo: "/brands/fortnite.svg", subtitle: "وی‌باکس و آیتم", description: "وی‌باکس و آیتم‌های Fortnite", showByDefault: true },
      { id: 3, brand: "Amazon", brandKey: "amazon", logo: "/brands/amazon.svg", subtitle: "خرید از آمازون", description: "گیفت کارت آمازون برای خرید از Amazon.com", showByDefault: true },
      { id: 4, brand: "Netflix", brandKey: "netflix", logo: "/brands/netflix.svg", subtitle: "اشتراک نتفلیکس", description: "گیفت کارت Netflix برای اشتراک ماهانه", showByDefault: true },
      { id: 5, brand: "Steam", brandKey: "steam", logo: "/brands/steam.svg", subtitle: "گیفت کارت استیم", description: "گیفت کارت Steam برای خرید بازی و DLC", showByDefault: true },
      { id: 6, brand: "iTunes", brandKey: "itunes", logo: "/brands/itunes.svg", subtitle: "آیتونز و اپ استور", description: "گیفت کارت iTunes و App Store", showByDefault: true },
      { id: 7, brand: "Google Play", brandKey: "google-play", logo: "/brands/googleplay.svg", subtitle: "گوگل پلی", description: "گیفت کارت Google Play برای خرید اپ و بازی", showByDefault: true },
      { id: 8, brand: "Spotify", brandKey: "spotify", logo: "/brands/spotify.svg", subtitle: "اشتراک اسپاتیفای", description: "گیفت کارت Spotify برای اشتراک Premium", showByDefault: true },
      { id: 9, brand: "فلیپ مانی", brandKey: "flow-money", logo: "/brands/flip-money.png", subtitle: "فلیپ مانی", description: "گیفت کارت فلیپ مانی برای خرید و تراکنش‌های مختلف", showByDefault: false },
    ];

    // Helper function to reload gift cards based on current user data
    const reloadGiftCards = () => {
      const savedGiftCards = localStorage.getItem("admin_gift_cards");
      
      if (!savedGiftCards) {
        setGiftCards(defaultCards.filter(c => c.showByDefault));
        return;
      }
      
      try {
        const allCards: GiftCard[] = JSON.parse(savedGiftCards);
        
        // اگر array خالی یا نامعتبر است، از پیش‌فرض استفاده کن
        // (دیگر شرط «کمتر از ۹ کارت» نداریم تا وقتی ادمین تعداد کارت‌ها را کم/زیاد می‌کند،
        //   منطق نمایش بر اساس تنظیمات جدید کاربر و ادمین باشد)
        if (!Array.isArray(allCards) || allCards.length === 0) {
          if (isLoggedIn) {
            setGiftCards(defaultCards.filter(c => c.showByDefault));
          } else {
            setGiftCards(defaultCards.filter(c => c.brandKey !== "flow-money"));
          }
          return;
        }
        
        if (isLoggedIn) {
          // برای کاربران لاگین شده: بررسی گیفت کارت‌های فعال شده
          const sessionUserId = localStorage.getItem("session_user_id");
          const allUsers = getUsers();
          
          let userVisibleCards: number[] = [];
          
          if (sessionUserId) {
            const user = allUsers.find((u: any) => u.id.toString() === sessionUserId);
            if (user) {
              // Parse visibleGiftCards - could be array or string
              let cards = user.visibleGiftCards;
              if (typeof cards === 'string') {
                try {
                  cards = JSON.parse(cards);
                } catch {
                  cards = [];
                }
              }
              userVisibleCards = Array.isArray(cards) ? cards : [];
            }
          }

          // نمایش گیفت کارت‌ها بر اساس تنظیمات ادمین
          // اگر visibleGiftCards خالی است یا undefined، کارت‌های پیش‌فرض را نمایش بده
          // اگر visibleGiftCards پر است، فقط کارت‌هایی که در لیست هستند را نمایش بده
          const visible = allCards.filter((card) => {
            // اگر کاربر لیست visibleGiftCards دارد و خالی نیست، فقط کارت‌های موجود در لیست را نمایش بده
            if (userVisibleCards && userVisibleCards.length > 0) {
              // تبدیل id ها به number برای مقایسه صحیح
              const cardId = typeof card.id === 'string' ? parseInt(card.id, 10) : card.id;
              return userVisibleCards.some((vid: any) => {
                const visibleId = typeof vid === 'string' ? parseInt(vid, 10) : vid;
                return visibleId === cardId;
              });
            }
            // اگر لیست خالی است یا undefined، کارت‌هایی که showByDefault: true دارند را نمایش بده
            return card.showByDefault === true;
          });

          // اگر هیچ کارتی نمایش داده نمی‌شود، از پیش‌فرض استفاده کن
          setGiftCards(visible.length > 0 ? visible : defaultCards.filter(c => c.showByDefault));
        } else {
          // برای کاربران غیر لاگین شده: نمایش تمامی کارت‌ها به جز Flow Money
          const visible = allCards.filter((card) => card.brandKey !== "flow-money");
          // اگر هیچ کارتی نمایش داده نمی‌شود، از پیش‌فرض استفاده کن (بدون Flow Money)
          setGiftCards(visible.length > 0 ? visible : defaultCards.filter(c => c.brandKey !== "flow-money"));
        }
      } catch (error) {
        // اگر خطا در parse بود، از پیش‌فرض استفاده کن
        console.error("❌ Error reloading gift cards:", error);
        setGiftCards(defaultCards.filter(c => c.showByDefault));
      }
    };

    // Initial load
    reloadGiftCards();

    // Listen for usersUpdated event
    const handleUsersUpdated = () => {
      reloadGiftCards();
    };
    
    window.addEventListener("usersUpdated", handleUsersUpdated);

    // Poll for changes every 10 seconds (reduced frequency to avoid race conditions)
    let lastUsersUpdate = 0;
    const interval = setInterval(() => {
      if (!isLoggedIn) return;
      
      const now = Date.now();
      // Only check API every 10 seconds
      if (now - lastUsersUpdate > 10000) {
        lastUsersUpdate = now;
        
        // Check localStorage directly first (faster and more reliable)
        const sessionUserId = localStorage.getItem("session_user_id");
        if (sessionUserId) {
          const allUsers = getUsers();
          const user = allUsers.find((u: any) => u.id.toString() === sessionUserId);
          if (user) {
            // Only reload if user data might have changed
            reloadGiftCards();
          }
        }
      }
    }, 10000); // Increased from 2000ms to 10000ms
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("usersUpdated", handleUsersUpdated);
    };
  }, [isLoggedIn]);

  const handleCardClick = (brandKey: string) => {
    // در فاز ۱، اجازه می‌دهیم همه کاربران (حتی بدون لاگین) صفحه جزئیات را ببینند
    // محدودیت خرید در صفحه جزئیات (با بررسی isLoggedIn) انجام می‌شود
    window.location.href = `/gift-cards/${brandKey}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
            گیفت کارت ها
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            خرید گیفت کارت‌های معتبر و قابل اعتماد برای سرویس‌های مختلف
          </p>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {giftCards.map((card) => (
            <Link
              key={card.id}
              href={`/gift-cards/${card.brandKey}`}
              className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-2 hover:border-white/20"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl bg-white/5 flex items-center justify-center mb-5 group-hover:bg-white/10 transition-colors border border-white/10 overflow-hidden p-5 lg:p-6">
                {card.logo ? (
                  <img
                    src={getAssetPath(card.logo)}
                    alt={card.brand}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-4xl">🎁</span>
                )}
              </div>
              <h3 className="font-semibold text-slate-100 mb-2 text-base sm:text-lg">
                {card.brand}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-4">
                {card.subtitle}
              </p>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                {card.description}
              </p>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-200 border border-white/10 rounded-lg hover:bg-white/5 transition-colors backdrop-blur-sm group-hover:border-cyan-500/50 group-hover:text-cyan-400">
                مشاهده و خرید
              </button>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            چرا گیفت کارت از ما بخرید؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 text-xl">⚡</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  تحویل فوری
                </h3>
                <p className="text-xs text-slate-400">
                  گیفت کارت‌ها به صورت آنی و خودکار تحویل داده می‌شوند
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  معتبر و قابل اعتماد
                </h3>
                <p className="text-xs text-slate-400">
                  همه گیفت کارت‌ها از منابع معتبر و رسمی تهیه می‌شوند
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 text-xl">💬</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  پشتیبانی 24/7
                </h3>
                <p className="text-xs text-slate-400">
                  تیم پشتیبانی ما همیشه آماده کمک به شماست
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
