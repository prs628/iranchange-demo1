"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DebugAuth() {
  const { isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const loadInfo = () => {
      if (typeof window === "undefined") return;
      
      const info = {
        isLoggedIn,
        user_name: localStorage.getItem("user_name"),
        user_email: localStorage.getItem("user_email"),
        user_phone: localStorage.getItem("user_phone"),
        admin_users: localStorage.getItem("admin_users"),
        cookie: document.cookie,
      };
      
      setUserInfo(info);
    };
    
    loadInfo();
    const interval = setInterval(loadInfo, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">دیباگ احراز هویت</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-2">وضعیت:</h2>
            <p>isLoggedIn: {isLoggedIn ? "✅ بله" : "❌ خیر"}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">localStorage:</h2>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">کاربران در admin_users:</h2>
            {userInfo?.admin_users ? (
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(JSON.parse(userInfo.admin_users), null, 2)}
              </pre>
            ) : (
              <p className="text-red-400">خالی است</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




