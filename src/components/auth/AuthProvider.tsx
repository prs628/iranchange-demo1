"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { isLoggedIn as checkIsLoggedIn, logoutDemo as clearLoginCookie, getSessionUser, migrateUsers, seedAdminUser } from "@/lib/auth";
import AuthModal from "./AuthModal";

type AuthContextType = {
  isModalOpen: boolean;
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  isLoggedIn: boolean;
  loginDemo: () => void;
  logoutDemo: () => void;
  authModalTab: "login" | "register";
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Initialize: migrate users and seed admin on first load
  useEffect(() => {
    if (typeof window !== "undefined") {
      migrateUsers();
      // Seed admin user (async)
      seedAdminUser().catch(console.error);
    }
  }, []);

  // Check auth status on mount and periodically
  const checkAuth = useCallback(() => {
    const newAuthStatus = checkIsLoggedIn();
    setIsLoggedIn(newAuthStatus);
  }, []);

  useEffect(() => {
    // Use queueMicrotask to avoid synchronous setState in effect
    queueMicrotask(() => {
      checkAuth();
    });
    
    const interval = setInterval(checkAuth, 500);
    
    // Also listen for storage changes (when login happens in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "session_user_id") {
        console.log("📢 Storage changed: session_user_id - checking auth...");
        queueMicrotask(() => {
          checkAuth();
        });
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuth]);

  const openAuthModal = useCallback((tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsModalOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setIsModalOpen(false), []);

  const loginDemo = useCallback(() => {
    // This is now handled by the login page
    // Keep for backward compatibility but it won't work without credentials
    setIsModalOpen(false);
  }, []);

  const logoutDemo = useCallback(() => {
    clearLoginCookie();
    // Clear session
    if (typeof window !== "undefined") {
      localStorage.removeItem("session_user_id");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_phone");
      localStorage.removeItem("user_name");
    }
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isModalOpen,
        openAuthModal,
        closeAuthModal,
        isLoggedIn,
        loginDemo,
        logoutDemo,
        authModalTab,
      }}
    >
      {children}
      {/* Render modal once at root level */}
      {isModalOpen && (
        <AuthModal
          isOpen={isModalOpen}
          onClose={closeAuthModal}
          initialTab={authModalTab}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

