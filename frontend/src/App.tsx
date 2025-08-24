import { AuthenticatedApp } from "@/components/authenticated-app";
import { Login } from "@/components/login";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/theme-provider";
import { useState } from "react";
import { StreamChat, User } from "stream-chat";

const USER_STORAGE_KEY = "chat-ai-app-user";
const apiKey = import.meta.env.VITE_STREAM_API_KEY as string;
const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

if (!apiKey) console.error("❌ Missing Stream API Key. Check your .env file!");
if (!backendUrl) console.error("❌ Missing VITE_BACKEND_URL. Check your .env file!");

const client = StreamChat.getInstance(apiKey);

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleUserLogin = async (authenticatedUser: User) => {
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${authenticatedUser.name}`;
    const userWithImage = { ...authenticatedUser, image: avatarUrl };

    try {
      const res = await fetch(`${backendUrl}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🔧 FIX: must be userId (camelCase) to match backend
        body: JSON.stringify({ userId: authenticatedUser.id }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token endpoint failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      if (!data?.token) {
        throw new Error("Token missing from /token response");
      }

      await client.connectUser(userWithImage, data.token);

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithImage));
      setUser(userWithImage);
    } catch (error) {
      console.error("❌ Error logging in user:", error);
      // (Optionally show a toast to the user here)
    }
  };

  const handleLogout = async () => {
    await client.disconnectUser();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-screen bg-background">
        {user ? (
          <AuthenticatedApp user={user} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleUserLogin} />
        )}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
