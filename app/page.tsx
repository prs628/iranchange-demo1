"use client";

// PHASE 1: NextAuth disabled temporarily
// import { useSession, signOut } from "next-auth/react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import Sidebar from "@/components/panel/Sidebar";
import Footer from "@/components/panel/Footer";
import { useState, useEffect } from "react";
import { getUsers, getSessionUser } from "@/lib/auth";

// Mock data
const suggestedServices = [
  { id: 1, title: "اکانت پی پال با حساب بانکی", price: "۲,۵۰۰,۰۰۰ تومان", badge: "پیشنهاد ویژه", icon: "💳" },
  { id: 2, title: "ویزا کارت مجازی", price: "۱,۲۰۰,۰۰۰ تومان", badge: null, icon: "💳" },
  { id: 3, title: "مسترکارت فیزیکی", price: "۳,۰۰۰,۰۰۰ تومان", badge: null, icon: "💳" },
  { id: 4, title: "گیفت کارت آمازون", price: "۵۰۰,۰۰۰ تومان", badge: null, icon: "📦" },
];

const cryptoPrices = [
  { symbol: "BTC", name: "بیت کوین", price: "۱۲,۵۰۰,۰۰۰,۰۰۰", change: "+۲.۴%" },
  { symbol: "ETH", name: "اتریوم", price: "۴,۲۰۰,۰۰۰,۰۰۰", change: "+۱.۸%" },
  { symbol: "USDT", name: "تتر", price: "۴۲,۰۰۰", change: "+۰.۱%" },
];

// اسلایدهای هدر صفحه اصلی
const heroSlides = [
  {
    id: 1,
    title: "اکانت پی پال با حساب بانکی آنلاین",
    description:
      "دریافت و ارسال پول با اکانت پی پال معتبر و قابل اعتماد؛ راهکار سریع و امن برای تراکنش‌های بین‌المللی.",
    primaryCta: "مشاهده جزئیات پی پال",
    primaryHref: "/paypal",
  },
  {
    id: 2,
    title: "خرید گیفت کارت سرویس‌های محبوب",
    description:
      "گیفت کارت پلی‌استیشن، استیم، نتفلیکس، گوگل‌پلی و ده‌ها سرویس دیگر با تحویل آنی و قیمت شفاف.",
    primaryCta: "مشاهده گیفت کارت‌ها",
    primaryHref: "/gift-cards",
  },
  {
    id: 3,
    title: "خرید و فروش ارزهای دیجیتال منتخب",
    description:
      "امکان تهیه بیت‌کوین، تتر و سایر ارزهای پرکاربرد با تسویه سریع و نرخ منصفانه برای استفاده در پرداخت‌ها.",
    primaryCta: "خرید ارز دیجیتال",
    primaryHref: "/crypto/buy",
  },
  {
    id: 4,
    title: "کارت‌های اعتباری بین‌المللی",
    description:
      "تهیه ویزا و مسترکارت مجازی و فیزیکی برای پرداخت اشتراک‌ها، رزرو هتل و خرید از سایت‌های خارجی.",
    primaryCta: "مشاهده کارت‌ها",
    primaryHref: "/cards/virtual",
  },
];

// داده‌های پیش‌فرض (فقط برای fallback)
const defaultGiftCards = [
  { id: 1, brand: "PlayStation", brandKey: "playstation", logo: "/brands/playstation.svg", subtitle: "گیفت کارت پلی استیشن" },
  { id: 2, brand: "Fortnite", brandKey: "fortnite", logo: "/brands/fortnite.svg", subtitle: "وی‌باکس و آیتم" },
  { id: 3, brand: "Amazon", brandKey: "amazon", logo: "/brands/amazon.svg", subtitle: "خرید از آمازون" },
  { id: 4, brand: "Netflix", brandKey: "netflix", logo: "/brands/netflix.svg", subtitle: "اشتراک نتفلیکس" },
  { id: 5, brand: "Steam", brandKey: "steam", logo: "/brands/steam.svg", subtitle: "گیفت کارت استیم" },
  { id: 6, brand: "iTunes", brandKey: "itunes", logo: "/brands/itunes.svg", subtitle: "آیتونز و اپ استور" },
  { id: 7, brand: "Google Play", brandKey: "google-play", logo: "/brands/googleplay.svg", subtitle: "گوگل پلی" },
  { id: 8, brand: "Spotify", brandKey: "spotify", logo: "/brands/spotify.svg", subtitle: "اشتراک اسپاتیفای" },
  { id: 9, brand: "فلیپ مانی", brandKey: "flow-money", logo: "/brands/flip-money.png", subtitle: "فلیپ مانی" },
];

export default function LandingPage() {
  // PHASE 1: NextAuth disabled temporarily
  // const { data: session, status } = useSession();
  // const isLoggedIn = !!session;
  const { isLoggedIn, openAuthModal, logoutDemo } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [giftCards, setGiftCards] = useState(defaultGiftCards);
  const [userName, setUserName] = useState<string>("");
  const [userVisibleCards, setUserVisibleCards] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  
  // Ensure gift cards are loaded on mount (fallback)
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Small delay to ensure other effects have run
    const timer = setTimeout(() => {
      if (!giftCards || giftCards.length === 0) {
        // همیشه Flow Money را فیلتر کن (چه لاگین شده باشی چه نه)
        // Flow Money فقط در صفحه "مشاهده همه" نمایش داده می‌شود
        setGiftCards(defaultGiftCards.filter(c => c.brandKey !== "flow-money"));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  // PHASE 1: Load user data from localStorage instead of NextAuth session
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (isLoggedIn) {
      const sessionUser = getSessionUser();
      if (sessionUser) {
        setUserName(sessionUser.name || "");
        // Parse visibleGiftCards - could be array or string
        let visibleCards = sessionUser.visibleGiftCards;
        if (typeof visibleCards === 'string') {
          try {
            visibleCards = JSON.parse(visibleCards);
          } catch {
            visibleCards = [];
          }
        }
        setUserVisibleCards(Array.isArray(visibleCards) ? visibleCards : []);
      } else {
        setUserName("");
        setUserVisibleCards([]);
      }
    } else {
      setUserName("");
      setUserVisibleCards([]);
    }
  }, [isLoggedIn]);

  // بارگذاری گیفت کارت‌های قابل مشاهده
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadGiftCards = () => {
      const savedGiftCards = localStorage.getItem("admin_gift_cards");
      
      // اگر admin_gift_cards وجود ندارد، از پیش‌فرض استفاده کن
      if (!savedGiftCards) {
        if (isLoggedIn) {
          setGiftCards(defaultGiftCards);
        } else {
          setGiftCards(defaultGiftCards.filter(c => c.brandKey !== "flow-money"));
        }
        return;
      }
      
      try {
        const allCards = JSON.parse(savedGiftCards);
        
        // اگر array خالی است یا کمتر از 9 کارت دارد، از پیش‌فرض استفاده کن
        // نکته: Flow Money در صفحه اصلی نمایش داده نمی‌شود (فقط در صفحه "مشاهده همه")
        if (!Array.isArray(allCards) || allCards.length === 0 || allCards.length < 9) {
          // همیشه Flow Money را فیلتر کن (چه لاگین شده باشی چه نه)
          setGiftCards(defaultGiftCards.filter(c => c.brandKey !== "flow-money"));
          return;
        }
        
        if (isLoggedIn) {
          // برای کاربران لاگین شده
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
          // نکته: Flow Money در صفحه اصلی نمایش داده نمی‌شود (فقط در صفحه "مشاهده همه")
          const visible = allCards
            .filter((card: any) => {
              // Flow Money را در صفحه اصلی نمایش نده
              if (card.brandKey === "flow-money") {
                return false;
              }
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
            })
            .map((card: any) => ({
              id: card.id,
              brand: card.brand,
              brandKey: card.brandKey,
              logo: card.logo,
              subtitle: card.subtitle,
            }));
          
          // اگر هیچ کارتی نمایش داده نمی‌شود، از پیش‌فرض استفاده کن (بدون Flow Money)
          setGiftCards(visible.length > 0 ? visible : defaultGiftCards.filter(c => c.brandKey !== "flow-money"));
        } else {
          // برای کاربران غیر لاگین شده: نمایش تمامی کارت‌ها به جز Flow Money
          const visible = allCards
            .filter((card: any) => card.brandKey !== "flow-money")
            .map((card: any) => ({
              id: card.id,
              brand: card.brand,
              brandKey: card.brandKey,
              logo: card.logo,
              subtitle: card.subtitle,
            }));
          // اگر هیچ کارتی نمایش داده نمی‌شود، از پیش‌فرض استفاده کن (بدون Flow Money)
          setGiftCards(visible.length > 0 ? visible : defaultGiftCards.filter(c => c.brandKey !== "flow-money"));
        }
      } catch (error) {
        // اگر خطا در parse بود، از پیش‌فرض استفاده کن
        // نکته: Flow Money در صفحه اصلی نمایش داده نمی‌شود (فقط در صفحه "مشاهده همه")
        console.error("Error loading gift cards:", error);
        setGiftCards(defaultGiftCards.filter(c => c.brandKey !== "flow-money"));
      }
    };
    
    // Load immediately
    loadGiftCards();
    
    // Listen for usersUpdated event to reload gift cards when user data changes
    const handleUsersUpdated = () => {
      loadGiftCards(); // Use the same load function
    };
    
    window.addEventListener("usersUpdated", handleUsersUpdated);
    
    // Helper function to reload gift cards based on current user data
    const reloadGiftCards = () => {
      loadGiftCards(); // Use the same load function
    };
    
    // PHASE 1: Poll for user data changes from localStorage (reduced frequency)
    // Only update if visibleGiftCards actually changed
    let lastVisibleCardsString = "";
    const interval = setInterval(() => {
      if (!isLoggedIn) return;
      
      // Get updated user data from localStorage
      const sessionUser = getSessionUser();
      if (sessionUser) {
        // Parse visibleGiftCards - could be array or string
        let visibleCards = sessionUser.visibleGiftCards;
        if (typeof visibleCards === 'string') {
          try {
            visibleCards = JSON.parse(visibleCards);
          } catch {
            visibleCards = [];
          }
        }
        const newVisibleCards = Array.isArray(visibleCards) ? visibleCards : [];
        const newVisibleCardsString = JSON.stringify(newVisibleCards);
        
        // Only update if cards actually changed
        if (newVisibleCardsString !== lastVisibleCardsString) {
          setUserVisibleCards(newVisibleCards);
          lastVisibleCardsString = newVisibleCardsString;
          // Reload gift cards after updating user data
          reloadGiftCards();
        }
      }
    }, 10000); // Increased from 5000ms to 10000ms to reduce unnecessary reloads
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("usersUpdated", handleUsersUpdated);
    };
  }, [isLoggedIn]); // Removed userVisibleCards to prevent infinite loops

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // اسلایدر هدر: تغییر خودکار اسلاید
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 relative flex flex-col" style={{ overflowX: 'hidden', width: '100%' }}>
      {/* Dark gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
      
      {/* Subtle radial accent glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)'
        }}
      />
      
      {/* Debug badge */}

      {/* Page content (header + body) */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top bar - Glass */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Right: Logo + Menu Button (mobile) */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Hamburger Menu Button - Mobile/Tablet */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              {/* Logo wrapper - کلیک روی لوگو → صفحه اصلی */}
              <Link href="/" className="flex items-center gap-2 flex-none shrink-0">
                <div className="h-10 sm:h-12 w-40 sm:w-48 overflow-hidden flex-none shrink-0">
                  <img
                    src="/log/iranchange-logo.png"
                    alt="Iranchange"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            </div>

            {/* Center: Search - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="جستجو در Iranchange"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Left: Auth Button */}
            <div className="flex-shrink-0">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/dashboard"
                    className="hidden sm:inline-block text-sm text-slate-300 hover:text-slate-100 font-medium transition-colors"
                  >
                    داشبورد
                  </Link>
                  {userName && (
                    <span className="hidden sm:inline-block text-sm text-slate-200 font-medium">
                      {userName}
                    </span>
                  )}
                  <button
                    onClick={logoutDemo}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs sm:text-sm font-medium hover:bg-red-500/30 transition-colors"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Mobile: Two separate buttons - Login and Register */}
                  <button
                    onClick={() => openAuthModal("login")}
                    className="sm:hidden px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-xs"
                  >
                    ورود
                  </button>
                  <button
                    onClick={() => openAuthModal("register")}
                    className="sm:hidden px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all text-xs"
                  >
                    ثبت‌نام
                  </button>
                  {/* Desktop: Combined button */}
                  <button
                    onClick={() => openAuthModal()}
                    className="hidden sm:inline-block px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm sm:text-base"
                  >
                    ورود / ثبت‌نام
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Mobile Only (below header) */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="جستجو در Iranchange"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm"
              />
            </div>
          </div>
          </div>
        </header>

        {/* Mobile/Tablet Sidebar Drawer Overlay */}
        {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-[320px] max-w-[85vw] z-50 lg:hidden">
            <div className="h-full glass-panel rounded-l-2xl shadow-2xl overflow-hidden">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-base font-semibold text-slate-100">منوی کاربری</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
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
              </div>
              {/* Drawer Content */}
              <div className="h-[calc(100vh-4rem)] overflow-y-auto">
                <Sidebar variant="dark" onLinkClick={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        </>
        )}

        {/* Two-column layout */}
        <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex items-start gap-4 lg:gap-6">
          {/* Desktop Sidebar - Hidden on mobile/tablet */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-auto rounded-2xl glass-panel shadow-xl">
              <Sidebar variant="dark" />
            </div>
          </aside>

            {/* Main content */}
            <main className="min-w-0 flex-1 w-full">
            {/* Hero Section - Large Glass Card */}
            <section className="mb-6 sm:mb-8 relative">
              {/* Accent glow blob behind hero */}
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none hidden lg:block" />
              
              <div className="relative glass-panel rounded-2xl p-4 sm:p-6 lg:p-8 overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  {heroSlides[activeHeroIndex] && (
                    <>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-100 mb-3 sm:mb-4 leading-tight">
                    {heroSlides[activeHeroIndex].title}
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-300 mb-4 sm:mb-6 max-w-2xl leading-relaxed">
                    {heroSlides[activeHeroIndex].description}
                  </p>
                  
                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4 sm:mb-6">
                    <Link
                      href={heroSlides[activeHeroIndex].primaryHref}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-center"
                    >
                      {heroSlides[activeHeroIndex].primaryCta}
                    </Link>
                  </div>

                  {/* Trust chips */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-full text-xs sm:text-sm text-slate-300 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block ml-2" />
                      تسویه سریع
                    </div>
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-full text-xs sm:text-sm text-slate-300 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block ml-2" />
                      پشتیبانی 24/7
                    </div>
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-full text-xs sm:text-sm text-slate-300 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-2" />
                      پرداخت امن
                    </div>
                  </div>

                  {/* Hero slider indicators */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {heroSlides.map((slide, index) => (
                      <button
                        key={slide.id}
                        onClick={() => setActiveHeroIndex(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeHeroIndex
                            ? "w-6 bg-cyan-400"
                            : "w-2.5 bg-white/30 hover:bg-white/60"
                        }`}
                        aria-label={`نمایش اسلاید ${index + 1}`}
                      />
                    ))}
                  </div>
                  </>
                  )}
                </div>
              </div>
            </section>

            {/* Main Content Sections */}
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
              {/* Gift Cards - Moved UP (first section) */}
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">گیفت کارت ها</h2>
                  <Link href="/gift-cards" className="text-xs sm:text-sm text-slate-400 hover:text-slate-200 font-medium transition-colors">
                    مشاهده همه
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {(giftCards && giftCards.length > 0 ? giftCards : defaultGiftCards)
                    .filter((card) =>
                      searchQuery
                        ? card.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          card.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((card) => (
                    <Link
                      key={card.id}
                      href={`/gift-cards/${card.brandKey}`}
                      className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1 sm:hover:-translate-y-2 hover:border-white/20"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-white/10 transition-colors border border-white/10 overflow-hidden p-4 sm:p-5 lg:p-6">
                        {card.logo ? (
                          <img
                            src={card.logo}
                            alt={card.brand}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-3xl sm:text-4xl">🎁</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-100 mb-1 text-xs sm:text-sm">{card.brand}</h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 mb-3 sm:mb-4">{card.subtitle}</p>
                      <button className="w-full px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-slate-200 border border-white/10 rounded-lg hover:bg-white/5 transition-colors backdrop-blur-sm">
                        مشاهده
                      </button>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Suggested Services - Moved DOWN (second section) */}
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">سرویس های پیشنهادی</h2>
                  <Link href="/services" className="text-xs sm:text-sm text-slate-400 hover:text-slate-200 font-medium transition-colors">
                    مشاهده همه
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {suggestedServices
                    .filter((service) =>
                      searchQuery
                        ? service.title.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((service) => (
                    <div
                      key={service.id}
                      className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:border-white/20"
                    >
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                          <span className="text-xl sm:text-2xl">{service.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-white transition-colors">
                              {service.title}
                            </h3>
                            {service.badge && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap">
                                {service.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-lg sm:text-xl font-semibold text-slate-100">{service.price}</p>
                        </div>
                      </div>
                      <button className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 border border-white/10 rounded-lg hover:bg-white/5 transition-colors backdrop-blur-sm">
                        خرید
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Crypto Prices - Glass Card */}
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-6 sm:mb-8">خرید ارزهای دیجیتال</h2>
                <div className="glass-panel rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 sm:p-6 border-b border-white/10">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-100">قیمت‌های لحظه‌ای</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">ارز</th>
                          <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">نام</th>
                          <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">قیمت</th>
                          <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">تغییرات</th>
                          <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cryptoPrices.map((crypto) => (
                          <tr
                            key={crypto.symbol}
                            className="border-t border-white/10 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 sm:py-5 px-4 sm:px-6">
                              <span className="text-sm sm:text-base font-semibold text-slate-100">{crypto.symbol}</span>
                            </td>
                            <td className="py-4 sm:py-5 px-4 sm:px-6 text-xs sm:text-sm text-slate-300 font-medium">{crypto.name}</td>
                            <td className="py-4 sm:py-5 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-100">{crypto.price} تومان</td>
                            <td className="py-4 sm:py-5 px-4 sm:px-6">
                              <span className="text-xs sm:text-sm text-cyan-400 font-medium">{crypto.change}</span>
                            </td>
                            <td className="py-4 sm:py-5 px-4 sm:px-6">
                              <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-xs sm:text-sm font-medium">
                                خرید
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
        </div>
      </div>

      {/* Global footer */}
      <Footer />
    </div>
  );
}
// deploy ping
