"use client";

import { useState, useEffect } from "react";
import { getUsers, getSessionUser, hashPassword, login, register } from "@/lib/auth";

export default function TestAuth() {
  const [users, setUsers] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    const loadData = () => {
      const allUsers = getUsers();
      const currentSession = getSessionUser();
      setUsers(allUsers);
      setSessionUser(currentSession);
    };
    
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const testAdminLogin = async () => {
    setTestResult("در حال تست...");
    try {
      const result = await login("admin@example.com", "Admin@12345");
      if (result.success) {
        setTestResult("✅ لاگین admin موفق بود!");
      } else {
        setTestResult(`❌ خطا: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ خطا: ${error.message}`);
    }
  };

  const testWrongPassword = async () => {
    setTestResult("در حال تست...");
    try {
      const result = await login("admin@example.com", "wrongpassword");
      if (!result.success) {
        setTestResult(`✅ تست موفق: رمز عبور اشتباه رد شد - ${result.error}`);
      } else {
        setTestResult("❌ خطا: رمز عبور اشتباه پذیرفته شد!");
      }
    } catch (error: any) {
      setTestResult(`❌ خطا: ${error.message}`);
    }
  };

  const clearAll = () => {
    localStorage.clear();
    setUsers([]);
    setSessionUser(null);
    setTestResult("✅ localStorage پاک شد. صفحه را refresh کنید.");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">تست احراز هویت</h1>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">وضعیت Session</h2>
          <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(sessionUser, null, 2) || "هیچ session فعالی وجود ندارد"}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">کاربران ({users.length})</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-900 p-3 rounded">
                <p><strong>نام:</strong> {user.name}</p>
                <p><strong>ایمیل:</strong> {user.email || "-"}</p>
                <p><strong>تلفن:</strong> {user.phone || "-"}</p>
                <p><strong>نقش:</strong> {user.role}</p>
                <p><strong>passwordHash:</strong> {user.passwordHash ? `${user.passwordHash.substring(0, 20)}...` : "❌ ندارد"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">تست‌ها</h2>
          <div className="space-y-3">
            <button
              onClick={testAdminLogin}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              تست لاگین Admin (admin@example.com / Admin@12345)
            </button>
            <button
              onClick={testWrongPassword}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              تست رمز عبور اشتباه
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
              پاک کردن همه چیز
            </button>
          </div>
          {testResult && (
            <div className="mt-4 p-3 bg-gray-900 rounded">
              <p>{testResult}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">localStorage</h2>
          <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
            users: {localStorage.getItem("users") ? "موجود" : "خالی"}
            {"\n"}
            session_user_id: {localStorage.getItem("session_user_id") || "خالی"}
            {"\n"}
            admin_users: {localStorage.getItem("admin_users") ? "موجود (باید migrate شود)" : "خالی"}
          </pre>
        </div>
      </div>
    </div>
  );
}




