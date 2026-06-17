"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "الرئيسية" },
  { href: "/add-income", icon: "➕", label: "دخل" },
  { href: "/add-expense", icon: "➖", label: "مصروف" },
  { href: "/goals", icon: "🎯", label: "أهداف" },
  { href: "/trading", icon: "📈", label: "تداول" },
  { href: "/settings", icon: "⚙️", label: "إعدادات" },
  { href: "/trading-log", icon: "📈", label: "exness his" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  if (status === "unauthenticated") redirect("/auth/login");
  if (status === "loading") return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <main style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px 120px 16px" }}>
        {children}
      </main>

      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTop: "1px solid #f1f5f9",
        zIndex: 50
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "12px 0",
          maxWidth: "480px",
          margin: "0 auto"
        }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  color: isActive ? "#4f46e5" : "#94a3b8",
                  fontSize: "20px"
                }}>
                  <span>{item.icon}</span>
                  <span style={{ fontSize: "10px", fontWeight: 500 }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}