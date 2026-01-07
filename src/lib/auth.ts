"use client";

/**
 * Authentication helper module
 * 
 * TODO: This localStorage-based auth is NOT secure for production.
 * Replace with server-side authentication using httpOnly cookies.
 */

export type UserRole = "user" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  orders?: number;
  totalSpent?: string;
  status?: "active" | "banned";
  joinDate?: string;
  visibleGiftCards?: number[];
};

// Hash password using Web Crypto API (SHA-256)
export async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("hashPassword can only be called in browser");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

const USERS_KEY = "users";
const USERS_BACKUP_KEY = "users_backup";

// Initialization guards to avoid running migration/seeding on every Fast Refresh
let hasMigratedUsersOnce = false;
let hasSeededAdminOnce = false;

// Safely parse JSON without throwing and without overwriting storage on error
function safeParseUsers(json: string | null): User[] | null {
  if (!json) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as User[]) : null;
  } catch (error) {
    console.error("❌ Error parsing users JSON:", error);
    return null;
  }
}

// Get all users from localStorage
export function getUsers(): User[] {
  if (typeof window === "undefined") return [];

  // 1) Try main key
  const usersJson = localStorage.getItem(USERS_KEY);
  const main = safeParseUsers(usersJson);
  if (main) return main as User[];

  // 2) Fall back to backup if main is corrupted
  const backupJson = localStorage.getItem(USERS_BACKUP_KEY);
  const backup = safeParseUsers(backupJson);
  if (backup) {
    console.warn("⚠️ Using users_backup because users JSON is invalid");
    return backup as User[];
  }

  console.log("📋 No valid users found in localStorage");
  return [];
}

// Save users to localStorage
export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;

  try {
    if (!Array.isArray(users)) {
      console.error("❌ Cannot save users: not an array", users);
      return;
    }
    // قبل از هر write، نسخه فعلی را در users_backup نگه دار
    const currentJson = localStorage.getItem(USERS_KEY);
    if (currentJson) {
      localStorage.setItem(USERS_BACKUP_KEY, currentJson);
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem("users_last_updated", Date.now().toString());
    console.log("✅ Saved users to localStorage:", users.length, "users");
    
    // Sync to API endpoints on both ports for cross-port communication
    if (typeof window !== "undefined" && typeof fetch !== "undefined") {
      // Try to sync to both ports
      Promise.all([
        fetch("http://localhost:3000/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users }),
        }).catch(() => null),
        fetch("http://localhost:3001/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users }),
        }).catch(() => null),
      ]).then(() => {
        console.log("📡 Synced users to both ports via API");
      }).catch((err) => {
        console.warn("⚠️ Failed to sync to API:", err);
      });
    }
    
    // Dispatch event to notify other components (especially admin panel)
    // This works across tabs/windows in the same browser
    window.dispatchEvent(new CustomEvent("usersUpdated"));
    console.log("📢 Dispatched usersUpdated event from saveUsers");
  } catch (error) {
    console.error("❌ Error saving users:", error);
  }
}

// Migrate from admin_users to users (one-time migration)
export function migrateUsers(): void {
  if (typeof window === "undefined") return;

  // In-memory guard (per tab)
  if (hasMigratedUsersOnce) {
    return;
  }
  hasMigratedUsersOnce = true;

  // sessionStorage guard (per browser session)
  try {
    if (window.sessionStorage.getItem("admin_users_migrated_once") === "1") {
      return;
    }
  } catch {
    // ignore sessionStorage errors, continue best-effort
  }

  const existingUsers = localStorage.getItem(USERS_KEY);
  const adminUsersJson = localStorage.getItem("admin_users");
  
  // If we have users already, check if we need to merge with admin_users
  const currentUsers = safeParseUsers(existingUsers) || [];

  if (!adminUsersJson) {
    // No legacy key: nothing to migrate
    return;
  }

  try {
    const adminUsersParsed = safeParseUsers(adminUsersJson) || [];
    if (Array.isArray(adminUsersParsed) && adminUsersParsed.length > 0) {
      // Convert old format to new format
      const migratedFromAdmin: User[] = adminUsersParsed.map((u: unknown) => {
        const user = u as Partial<User> & { joinDate?: string; id?: number | string };
        // Fix createdAt - ensure it's a valid ISO string
        let createdAt = new Date().toISOString();
        if (user.joinDate) {
          try {
            const date = new Date(user.joinDate);
            if (!isNaN(date.getTime())) {
              createdAt = date.toISOString();
            }
          } catch {
            // Use current date if joinDate is invalid
            createdAt = new Date().toISOString();
          }
        }
        
        return {
          id: user.id || Date.now() + Math.random(),
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: (user.role === "admin" ? "admin" : "user") as UserRole,
          passwordHash: user.passwordHash || "", // Keep if exists
          createdAt,
          orders: user.orders || 0,
          totalSpent: user.totalSpent || "۰",
          status: user.status || "active",
          joinDate: user.joinDate,
          visibleGiftCards: user.visibleGiftCards || [],
        };
      });

      // Merge by unique email/phone/id
      const mergedMap = new Map<string, User>();

      const addUser = (u: User) => {
        const key =
          (u.email && u.email.trim().toLowerCase()) ||
          (u.phone && u.phone.trim()) ||
          u.id.toString();
        if (!mergedMap.has(key)) {
          mergedMap.set(key, u);
        }
      };

      currentUsers.forEach(addUser);
      migratedFromAdmin.forEach(addUser);

      const mergedUsers = Array.from(mergedMap.values());
      if (mergedUsers.length !== currentUsers.length) {
        console.log(
          "✅ Migrated and merged users from admin_users into users:",
          "before:",
          currentUsers.length,
          "after:",
          mergedUsers.length
        );
        saveUsers(mergedUsers);
      }

      // بعد از مهاجرت موفق، دیگر هرگز از admin_users استفاده نکن
      localStorage.removeItem("admin_users");
      localStorage.setItem("admin_users_migrated", "true");
      try {
        window.sessionStorage.setItem("admin_users_migrated_once", "1");
      } catch {
        // non-fatal
      }
    }
  } catch (error) {
    console.error("❌ Error migrating users:", error);
  }
}

// Seed default admin user
export async function seedAdminUser(): Promise<void> {
  if (typeof window === "undefined") return;

  // In-memory guard (per tab)
  if (hasSeededAdminOnce) {
    return;
  }
  hasSeededAdminOnce = true;

  // sessionStorage guard (per browser session)
  try {
    if (window.sessionStorage.getItem("admin_seeded_once") === "1") {
      return;
    }
  } catch {
    // ignore and continue
  }

  try {
    const users = getUsers();
    
    // اگر هیچ کاربری وجود ندارد، ادمین پیش‌فرض را seed کن
    if (users.length === 0) {
      console.log("ℹ️ No users found, seeding default admin user");
    } else {
      // اگر کاربر داریم، فقط در صورتی کاری انجام بده که هیچ ادمینی نباشد
      const adminExists = users.some(
        (u) =>
          u.role === "admin" ||
          u.email === "admin@example.com"
      );
      if (adminExists) {
        return;
      }
    }
    // Create admin user
    const adminPassword = "Admin@12345";
    const passwordHash = await hashPassword(adminPassword);

    const adminUser: User = {
      id: Date.now(),
      name: "مدیر سیستم",
      email: "admin@example.com",
      phone: "",
      role: "admin",
      passwordHash,
      createdAt: new Date().toISOString(),
      orders: 0,
      totalSpent: "۰",
      status: "active",
      visibleGiftCards: [],
    };

    users.push(adminUser);
    saveUsers(users);
    console.log("✅ Seeded default admin user:", adminUser.email);

    try {
      window.sessionStorage.setItem("admin_seeded_once", "1");
    } catch {
      // ignore
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
}

// Register new user
export async function register(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  if (typeof window === "undefined") {
    return { success: false, error: "localStorage not available" };
  }

  try {
    const users = getUsers();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();

    console.log("🔍 Registering user:", {
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      totalUsers: users.length,
    });

    // Check if user already exists
    // Only check non-empty values to avoid false positives
    const existingUser = users.find((u) => {
      if (normalizedEmail && u.email && u.email === normalizedEmail) {
        console.log("❌ Found existing user with email:", u.email);
        return true;
      }
      if (normalizedPhone && u.phone && u.phone === normalizedPhone) {
        console.log("❌ Found existing user with phone:", u.phone);
        return true;
      }
      return false;
    });

    if (existingUser) {
      console.log("❌ User already exists:", existingUser);
      return { success: false, error: "این ایمیل یا شماره تلفن قبلاً ثبت شده است" };
    }

    console.log("✅ No duplicate found, creating new user...");

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser: User = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      role: "user",
      passwordHash,
      createdAt: new Date().toISOString(),
      orders: 0,
      totalSpent: "۰",
      status: "active",
      visibleGiftCards: [],
    };

    users.push(newUser);
    saveUsers(users);
    
    console.log("✅ New user registered and saved:", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      totalUsers: users.length
    });

    // Sync to API endpoint for cross-port communication
    if (typeof window !== "undefined") {
      try {
        // Try to sync to API (works across ports)
        fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users }),
        }).then(() => {
          console.log("📡 Synced users to API endpoint");
        }).catch((err) => {
          console.warn("⚠️ Failed to sync to API:", err);
        });
      } catch (e) {
        // Ignore API sync errors
      }
    }

    // Dispatch event to notify other components (especially admin panel)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("usersUpdated"));
      console.log("📢 Dispatched usersUpdated event");
    }

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "خطا در ثبت نام" };
  }
}

// Login
export async function login(
  emailOrPhone: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  if (typeof window === "undefined") {
    return { success: false, error: "localStorage not available" };
  }

  try {
    const users = getUsers();
    const isEmail = emailOrPhone.includes("@");
    const email = isEmail ? emailOrPhone.trim() : "";
    const phone = isEmail ? "" : emailOrPhone.trim();

    // Find user
    const user = users.find((u) => u.email === email || u.phone === phone);

    if (!user) {
      return { success: false, error: "Invalid email/phone or password" };
    }

    // Check if user has password hash (migrated users might not have it)
    if (!user.passwordHash || user.passwordHash === "") {
      return { success: false, error: "این حساب کاربری نیاز به تنظیم مجدد رمز عبور دارد. لطفاً دوباره ثبت نام کنید." };
    }

    // Hash entered password and compare
    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: "Invalid email/phone or password" };
    }

    // Set session
    localStorage.setItem("session_user_id", user.id.toString());
    localStorage.setItem("user_email", user.email);
    localStorage.setItem("user_phone", user.phone);
    localStorage.setItem("user_name", user.name);

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "خطا در ورود" };
  }
}

// Logout
export function logout(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("session_user_id");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_phone");
  localStorage.removeItem("user_name");
}

// Get current session user
export function getSessionUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const sessionUserId = localStorage.getItem("session_user_id");
    if (!sessionUserId) return null;

    const users = getUsers();
    const user = users.find((u) => u.id.toString() === sessionUserId);
    return user || null;
  } catch (error) {
    console.error("Error getting session user:", error);
    return null;
  }
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return getSessionUser() !== null;
}

// Legacy functions for backward compatibility
export function getAuthFromCookie(): boolean {
  return isLoggedIn();
}

export function setAuthCookie(): void {
  // This is now handled by login()
}

export function clearAuthCookie(): void {
  logout();
}

export function getAuth(): boolean {
  return isLoggedIn();
}

export function setAuth(value: boolean): void {
  if (!value) {
    logout();
  }
  // If value is true, we can't set auth without credentials
  // This should be handled by login() function
}

export function loginDemo(): void {
  // Legacy function - use login() instead
}

export function logoutDemo(): void {
  logout();
}
