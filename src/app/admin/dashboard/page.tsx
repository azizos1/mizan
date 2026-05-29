// src/app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allWallets, setAllWallets] = useState<any[]>([]);
  const [allGoals, setAllGoals] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [allClicks, setAllClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "loading") return;
    fetchData();
  }, [status]);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setAllUsers(data.allUsers || []);
        setAllWallets(data.allWallets || []);
        setAllGoals(data.allGoals || []);
        setAllTransactions(data.allTransactions || []);
        setAllClicks(data.allClicks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loginAs(userId: string) {
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        alert(data.error || "خطأ");
      }
    } catch (err) {
      alert("خطأ في الاتصال");
    }
  }

  if (loading) return <p style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>جاري التحميل...</p>;

  const totalUsers = allUsers.length;
  const totalIncome = allTransactions.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpenses = allTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalSaved = allWallets.filter((w) => w.type === "system").reduce((s, w) => s + parseFloat(w.balance), 0);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>🛡️ لوحة المشرف</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <a href="/dashboard" style={{ backgroundColor: "#4f46e5", color: "white", textDecoration: "none", padding: "10px 20px", borderRadius: "14px", fontSize: "14px", fontWeight: 700 }}>← لوحتي</a>
            <a href="/api/auth/signout" style={{ backgroundColor: "#fee2e2", color: "#dc2626", textDecoration: "none", padding: "10px 16px", borderRadius: "14px", fontSize: "14px", fontWeight: 600 }}>🚪 خروج</a>
          </div>
        </div>

        {/* إحصائيات عامة */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
          {[
            { label: "المستخدمين", value: totalUsers, emoji: "👥", color: "#4f46e5" },
            { label: "الدخل", value: `${totalIncome.toLocaleString("ar-TN")} د.ت`, emoji: "💰", color: "#059669" },
            { label: "المصروفات", value: `${totalExpenses.toLocaleString("ar-TN")} د.ت`, emoji: "💸", color: "#dc2626" },
            { label: "المدخرات", value: `${totalSaved.toLocaleString("ar-TN")} د.ت`, emoji: "🏦", color: "#f59e0b" },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
              <p style={{ fontSize: "32px", margin: "0 0 8px 0" }}>{stat.emoji}</p>
              <p style={{ color: stat.color, fontSize: "18px", fontWeight: 800, margin: 0 }}>{stat.value}</p>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0 0" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* إحصائيات التداول */}
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 800, margin: "0 0 16px 0" }}>📈 نقرات التداول</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "#fffbeb", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", margin: "0 0 4px 0" }}>👆</p>
              <p style={{ color: "#d97706", fontSize: "24px", fontWeight: 800, margin: 0 }}>{allClicks.length}</p>
              <p style={{ color: "#92400e", fontSize: "12px", margin: "2px 0 0 0" }}>إجمالي النقرات</p>
            </div>
            <div style={{ backgroundColor: "#ecfdf5", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", margin: "0 0 4px 0" }}>👤</p>
              <p style={{ color: "#059669", fontSize: "24px", fontWeight: 800, margin: 0 }}>
                {new Set(allClicks.filter((c: any) => c.userId).map((c: any) => c.userId)).size}
              </p>
              <p style={{ color: "#065f46", fontSize: "12px", margin: "2px 0 0 0" }}>مستخدمين</p>
            </div>
            <div style={{ backgroundColor: "#eef2ff", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", margin: "0 0 4px 0" }}>👻</p>
              <p style={{ color: "#4f46e5", fontSize: "24px", fontWeight: 800, margin: 0 }}>
                {allClicks.filter((c: any) => !c.userId).length}
              </p>
              <p style={{ color: "#3730a3", fontSize: "12px", margin: "2px 0 0 0" }}>زوار</p>
            </div>
          </div>
          <h3 style={{ color: "#0f172a", fontSize: "14px", fontWeight: 700, margin: "0 0 12px 0" }}>آخر 10 نقرات</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "right" }}>
                <th style={{ padding: "8px", color: "#94a3b8" }}>المستخدم</th>
                <th style={{ padding: "8px", color: "#94a3b8" }}>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {allClicks.slice(-10).reverse().map((click: any) => {
                const user = allUsers.find((u: any) => u.id === click.userId);
                return (
                  <tr key={click.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px", color: "#0f172a", fontWeight: 600 }}>
                      {user ? user.email : "👻 زائر"}
                    </td>
                    <td style={{ padding: "8px", color: "#94a3b8" }}>
                      {new Date(click.clickedAt).toLocaleString("ar-TN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* جدول المستخدمين */}
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 800, margin: "0 0 16px 0" }}>👥 المستخدمين</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "right" }}>
                  <th style={{ padding: "12px 8px", color: "#94a3b8" }}>الاسم</th>
                  <th style={{ padding: "12px 8px", color: "#94a3b8" }}>البريد</th>
                  <th style={{ padding: "12px 8px", color: "#94a3b8" }}>المحافظ</th>
                  <th style={{ padding: "12px 8px", color: "#94a3b8" }}>الأهداف</th>
                  <th style={{ padding: "12px 8px", color: "#94a3b8" }}>الدور</th>
                  <th style={{ padding: "12px 8px", color: "#94a3b8" }}>التسجيل</th>
                  <th style={{ padding: "12px 8px", color: "#94a3b8" }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => {
                  const userWallets = allWallets.filter((w) => w.userId === u.id);
                  const userGoals = allGoals.filter((g) => g.userId === u.id);
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 8px", color: "#0f172a", fontWeight: 600 }}>{u.name || "-"}</td>
                      <td style={{ padding: "12px 8px", color: "#64748b" }}>{u.email}</td>
                      <td style={{ padding: "12px 8px", color: "#4f46e5", fontWeight: 600 }}>{userWallets.length}</td>
                      <td style={{ padding: "12px 8px", color: "#059669", fontWeight: 600 }}>{userGoals.length}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ backgroundColor: u.role === "admin" ? "#eef2ff" : "#f1f5f9", color: u.role === "admin" ? "#4f46e5" : "#64748b", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600 }}>
                          {u.role === "admin" ? "مشرف" : "مستخدم"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", color: "#94a3b8", fontSize: "11px" }}>{new Date(u.createdAt!).toLocaleDateString("ar-TN")}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <button onClick={() => loginAs(u.id)} style={{ backgroundColor: "#4f46e5", color: "white", border: "none", padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                          👁️ دخول
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* الأهداف */}
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 800, margin: "0 0 16px 0" }}>🎯 الأهداف</h2>
          {allGoals.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>لا توجد أهداف</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {allGoals.map((g) => {
                const user = allUsers.find((u) => u.id === g.userId);
                const wallet = allWallets.find((w) => w.id === g.walletId);
                const balance = wallet ? parseFloat(wallet.balance) : 0;
                const target = parseFloat(g.targetAmount);
                const pct = target > 0 ? Math.round((balance / target) * 100) : 0;
                return (
                  <div key={g.id} style={{ backgroundColor: "#f8fafc", borderRadius: "14px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ color: "#0f172a", fontSize: "14px", fontWeight: 700, margin: 0 }}>{g.name}</p>
                      <p style={{ color: "#94a3b8", fontSize: "11px", margin: "2px 0 0 0" }}>{user?.email || "?"}</p>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ color: "#0f172a", fontSize: "14px", fontWeight: 700, margin: 0 }}>{balance.toLocaleString("ar-TN")} / {target.toLocaleString("ar-TN")}</p>
                      <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "6px", overflow: "hidden", marginTop: "4px", width: "120px" }}>
                        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "#4f46e5", borderRadius: "6px" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}