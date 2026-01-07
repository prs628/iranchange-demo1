"use client";

import { useState, useEffect } from "react";

export default function TestLocalStorage() {
  const [users, setUsers] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const loadData = () => {
      // بررسی کاربران
      const savedUsers = localStorage.getItem("admin_users");
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed)) {
            setUsers(parsed);
          }
        } catch (e) {
          console.error("خطا:", e);
        }
      }

      // بررسی نام کاربر
      const name = localStorage.getItem("user_name");
      setUserName(name || "خالی");
    };

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    setUsers([]);
    setUserName("");
    alert("localStorage پاک شد!");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">تست localStorage</h1>

        <div className="mb-6">
          <button
            onClick={clearStorage}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            پاک کردن localStorage
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">نام کاربر فعلی:</h2>
          <p className="text-lg">{userName}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">کاربران در localStorage:</h2>
          <p className="text-lg mb-4">تعداد: {users.length}</p>
          <div className="bg-gray-800 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(users, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">مقدار خام localStorage:</h2>
          <div className="bg-gray-800 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {localStorage.getItem("admin_users") || "خالی"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}




