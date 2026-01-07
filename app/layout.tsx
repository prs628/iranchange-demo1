import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import BuildBadge from "@/components/BuildBadge";
// PHASE 1: NextAuth disabled temporarily
// import SessionProvider from "@/components/auth/SessionProvider";

export const metadata: Metadata = {
  title: "Iranchange",
  description: "پنل مدیریت Iranchange",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {/* PHASE 1: NextAuth disabled temporarily */}
        {/* <SessionProvider> */}
          <AuthProvider>
            {children}
            <BuildBadge />
          </AuthProvider>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
