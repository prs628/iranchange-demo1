"use client";

import { useState, useEffect, useCallback } from "react";
import { isLoggedIn as checkIsLoggedIn, loginDemo as setLoginCookie, logoutDemo as clearLoginCookie } from "@/lib/auth";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check auth status
  const checkAuth = useCallback(() => {
    const authStatus = checkIsLoggedIn();
    setIsLoggedIn(authStatus);
    setIsChecking(false);
  }, []);

  // Initialize auth status on mount
  useEffect(() => {
    // Use queueMicrotask to avoid synchronous setState in effect
    queueMicrotask(() => {
      checkAuth();
    });
  }, [checkAuth]);

  // Poll for cookie changes (in case cookie is set/cleared elsewhere)
  useEffect(() => {
    const interval = setInterval(checkAuth, 500);
    return () => clearInterval(interval);
  }, [checkAuth]);

  const loginDemo = useCallback(() => {
    setLoginCookie();
    setIsLoggedIn(true);
  }, []);

  const logoutDemo = useCallback(() => {
    clearLoginCookie();
    setIsLoggedIn(false);
  }, []);

  return {
    isLoggedIn,
    isChecking,
    loginDemo,
    logoutDemo,
  };
}





