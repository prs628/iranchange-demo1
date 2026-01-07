"use client";

import { useState, useEffect } from "react";
import { getUsers, register, hashPassword } from "@/lib/auth";

export default function TestUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string>("");

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers);
    console.log("📋 Current users:", allUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleTestRegister = async () => {
    setTestResult("در حال تست...");
    
    try {
      const testName = `تست ${Date.now()}`;
      const testEmail = `test${Date.now()}@example.com`;
      const testPhone = `0912${Date.now().toString().slice(-7)}`;
      const testPassword = "Test123456";
      
      console.log("🔄 Testing registration...");
      const result = await register(testName, testEmail, testPhone, testPassword);
      
      if (result.success) {
        setTestResult(`✅ ثبت‌نام موفق! کاربر: ${result.user?.name}`);
        loadUsers();
      } else {
        setTestResult(`❌ خطا: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ خطا: ${error.message}`);
      console.error("Test error:", error);
    }
  };

  const handleCheckLocalStorage = () => {
    if (typeof window === "undefined") {
      setTestResult("❌ window is undefined");
      return;
    }
    
    const usersJson = localStorage.getItem("users");
    const adminUsersJson = localStorage.getItem("admin_users");
    
    console.log("📋 localStorage 'users':", usersJson);
    console.log("📋 localStorage 'admin_users':", adminUsersJson);
    
    if (usersJson) {
      try {
        const parsed = JSON.parse(usersJson);
        setTestResult(`✅ localStorage 'users' موجود: ${parsed.length} کاربر\n${JSON.stringify(parsed, null, 2)}`);
      } catch (e) {
        setTestResult(`❌ خطا در parse: ${e}`);
      }
    } else {
      setTestResult("❌ localStorage 'users' موجود نیست");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-white mb-4">تست کاربران</h1>
          
          <div className="space-y-4">
            <button
              onClick={handleTestRegister}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              تست ثبت‌نام کاربر جدید
            </button>
            
            <button
              onClick={handleCheckLocalStorage}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium mr-4"
            >
              بررسی localStorage
            </button>
            
            <button
              onClick={loadUsers}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium mr-4"
            >
              بارگذاری مجدد کاربران
            </button>
          </div>
          
          {testResult && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <pre className="text-sm text-white whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">کاربران فعلی ({users.length})</h2>
          
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email || user.phone}</p>
                    <p className="text-gray-500 text-xs">Role: {user.role} | ID: {user.id} | Created: {user.createdAt}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    user.role === "admin" 
                      ? "bg-purple-500/20 text-purple-400" 
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <p className="text-gray-400 text-center py-8">هیچ کاربری یافت نشد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




