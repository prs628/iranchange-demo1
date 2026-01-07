/**
 * Cross-port user synchronization utility
 * Since localStorage is isolated by origin (port), we need a shared storage mechanism
 */

const SYNC_KEY = "users_sync_data";
const SYNC_INTERVAL = 1000; // 1 second

// Store users in a shared location that both ports can access
export function syncUsersToSharedStorage(users: unknown[]): void {
  if (typeof window === "undefined") return;
  
  try {
    // Use sessionStorage as a bridge (it's also isolated, but we'll use a different approach)
    // Actually, we'll use a custom event that can be listened to across ports via BroadcastChannel
    // But BroadcastChannel also doesn't work across ports...
    
    // Best solution: Use a shared file or API endpoint
    // For now, let's use a combination of localStorage + polling
    
    // Store in current port's localStorage (single source of truth key)
    localStorage.setItem("users_backup", localStorage.getItem("users") || "[]");
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("users_last_updated", Date.now().toString());
    
    // Try to sync via API
    if (typeof fetch !== "undefined") {
      // Try both ports
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
      });
    }
  } catch (error) {
    console.error("❌ Error syncing users:", error);
  }
}

// Poll for users from the other port
export function pollUsersFromOtherPort(
  currentPort: number,
  onUsersUpdate: (users: unknown[]) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  
  const otherPort = currentPort === 3000 ? 3001 : 3000;
  const apiUrl = `http://localhost:${otherPort}/api/users/sync`;
  
  const interval = setInterval(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.users && Array.isArray(data.users)) {
          const currentUsers = JSON.parse(localStorage.getItem("users") || "[]");
          const currentUsersJson = JSON.stringify(currentUsers);
          const newUsersJson = JSON.stringify(data.users);
          
          // If we got more users from the other port, update our localStorage
          if (newUsersJson !== currentUsersJson && data.users.length >= currentUsers.length) {
            console.log(`📡 Received users from port ${otherPort}:`, data.users.length);
            localStorage.setItem("users", JSON.stringify(data.users));
            onUsersUpdate(data.users);
          }
        }
      })
      .catch(() => {
        // Silently ignore errors (other port might not be running)
      });
  }, SYNC_INTERVAL);
  
  return () => clearInterval(interval);
}



