import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { wallets, transactions, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id!;
  
  // جلب الإعدادات
  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
  const symbol = settings?.currencySymbol || "د.ت";
  const emergGoal = settings?.emergencyGoal ? parseFloat(settings.emergencyGoal) : 3000;

  const userWallets = await db.select().from(wallets).where(eq(wallets.userId, userId));
  const systemWallets = userWallets.filter((w) => w.type === "system");
  const goalWallets = userWallets.filter((w) => w.type === "goal");
  const totalBalance = systemWallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);

  const allTx = await db.select().from(transactions).where(eq(transactions.userId, userId));
  const totalIncome = allTx.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayExpenses = allTx.filter((t) => t.type === "expense" && new Date(t.createdAt!) >= today).reduce((s, t) => s + parseFloat(t.amount), 0);

  const saved = systemWallets.filter((w) => ["استثمار", "طوارئ"].includes(w.name)).reduce((s, w) => s + parseFloat(w.balance), 0);
  const savingsRate = totalIncome > 0 ? Math.min(Math.round((saved / totalIncome) * 100), 100) : 0;

  const emergencyWallet = systemWallets.find((w) => w.name === "طوارئ");
  const emergencyBalance = parseFloat(emergencyWallet?.balance || "0");
  const emergencyProgress = Math.min(Math.round((emergencyBalance / emergGoal) * 100), 100);

  const recent = allTx.filter((t) => t.type === "income" || t.type === "expense").sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء الورد";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* CARD 1: Welcome + Logout */}
      <div style={{
        backgroundColor: "white", borderRadius: "24px", padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>{greeting} 👋</p>
          <h1 style={{ color: "#0f172a", fontSize: "28px", fontWeight: 800, margin: "4px 0 0 0" }}>
            {session.user.name?.split(" ")[0]}
          </h1>
        </div>
        <a href="/api/auth/signout" style={{
          backgroundColor: "#fee2e2", color: "#dc2626", padding: "10px 16px",
          borderRadius: "14px", textDecoration: "none", fontSize: "14px", fontWeight: 600
        }}>🚪 خروج</a>
      </div>

      {/* CARD 2: Total Balance */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: "24px",
        padding: "28px", color: "white"
      }}>
        <p style={{ color: "#c7d2fe", fontSize: "14px", margin: 0 }}>الرصيد الإجمالي</p>
        <p style={{ fontSize: "40px", fontWeight: 900, margin: "8px 0 0 0" }}>
          {totalBalance.toLocaleString("ar-TN")}
          <span style={{ fontSize: "18px", fontWeight: 400, color: "#c7d2fe", marginRight: "8px" }}>{symbol}</span>
        </p>
      </div>

      {/* CARD 3: Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        {[
          { label: "الدخل", value: totalIncome, emoji: "💰" },
          { label: "المدخر", value: saved, emoji: "🏦" },
          { label: "اليوم", value: todayExpenses, emoji: "📅" },
        ].map((stat) => (
          <div key={stat.label} style={{
            backgroundColor: "white", borderRadius: "20px", padding: "20px 16px", textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9"
          }}>
            <p style={{ fontSize: "28px", margin: "0 0 8px 0" }}>{stat.emoji}</p>
            <p style={{ color: "#0f172a", fontSize: "20px", fontWeight: 700, margin: 0 }}>
              {stat.value.toLocaleString("ar-TN")}
            </p>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0 0" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* CARD 4 + 5: Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <a href="/add-income" style={{ textDecoration: "none" }}>
          <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "24px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px 0" }}>➕</p>
            <p style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: 0 }}>إضافة دخل</p>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>توزيع تلقائي</p>
          </div>
        </a>
        <a href="/add-expense" style={{ textDecoration: "none" }}>
          <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "24px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px 0" }}>➖</p>
            <p style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: 0 }}>إضافة مصروف</p>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>تتبع يومي</p>
          </div>
        </a>
      </div>

      {/* CARD 6: Financial Health */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <p style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: 0 }}>🩺 الصحة المالية</p>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "2px 0 0 0" }}>تقييم أدائك المالي</p>
          </div>
          <p style={{ color: "#4f46e5", fontSize: "28px", fontWeight: 900, margin: 0 }}>
            {savingsRate}<span style={{ fontSize: "16px", color: "#94a3b8" }}>/100</span>
          </p>
        </div>
        <div style={{ height: "10px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${savingsRate}%`, backgroundColor: "#4f46e5", borderRadius: "10px" }} />
        </div>
      </div>

      {/* CARD 7: Emergency Fund */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <p style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: 0 }}>🛡️ صندوق الطوارئ</p>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "2px 0 0 0" }}>الهدف: {emergGoal.toLocaleString("ar-TN")} {symbol}</p>
          </div>
          <p style={{ color: "#f59e0b", fontSize: "28px", fontWeight: 900, margin: 0 }}>{emergencyProgress}%</p>
        </div>
        <div style={{ height: "10px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ height: "100%", width: `${emergencyProgress}%`, backgroundColor: "#f59e0b", borderRadius: "10px" }} />
        </div>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
          تم توفير: <span style={{ color: "#0f172a", fontWeight: 700 }}>{emergencyBalance.toLocaleString("ar-TN")} {symbol}</span>
        </p>
      </div>

      {/* Goals Reminder */}
      {goalWallets.length > 0 && (
        <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 800, margin: "0 0 16px 0" }}>🎯 تذكير الأهداف</h2>
          {goalWallets.map((gw) => {
            const balance = parseFloat(gw.balance);
            return (
              <div key={gw.id} style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "24px" }}>🎯</span>
                  <div>
                    <p style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700, margin: 0 }}>{gw.name.replace("هدف: ", "")}</p>
                    <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0 0 0" }}>تم توفير: {balance.toLocaleString("ar-TN")} {symbol}</p>
                  </div>
                </div>
                <a href="/goals" style={{ color: "#4f46e5", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>تفاصيل →</a>
              </div>
            );
          })}
        </div>
      )}

      {/* Wallets */}
      <div>
        <h2 style={{ color: "#0f172a", fontSize: "20px", fontWeight: 800, margin: "0 0 16px 0" }}>💰 المحافظ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {systemWallets.map((w) => {
            const balance = parseFloat(w.balance);
            const pct = totalBalance > 0 ? Math.round((balance / totalBalance) * 100) : 0;
            const colors: Record<string, { bg: string; text: string }> = {
              "استثمار": { bg: "#ecfdf5", text: "#059669" },
              "طوارئ": { bg: "#fffbeb", text: "#d97706" },
              "عائلة": { bg: "#eff6ff", text: "#2563eb" },
              "صدقة": { bg: "#faf5ff", text: "#7c3aed" },
              "حياة يومية": { bg: "#f9fafb", text: "#6b7280" },
            };
            const c = colors[w.name] || colors["حياة يومية"];
            const emojis: Record<string, string> = {
              "استثمار": "📈", "طوارئ": "🛡️", "عائلة": "👨‍👩‍👧‍👦", "صدقة": "🤲", "حياة يومية": "🏠"
            };
            return (
              <div key={w.id} style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{emojis[w.name] || "💰"}</div>
                  <div>
                    <p style={{ color: "#0f172a", fontSize: "16px", fontWeight: 700, margin: 0 }}>{w.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                      <div style={{ width: "60px", height: "6px", backgroundColor: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: c.text, borderRadius: "6px" }} />
                      </div>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>{pct}%</span>
                    </div>
                  </div>
                </div>
                <p style={{ color: "#0f172a", fontSize: "20px", fontWeight: 800, margin: 0 }}>{balance.toLocaleString("ar-TN")} <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 400 }}>{symbol}</span></p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trading Card */}
      <a href="/trading" style={{ textDecoration: "none" }}>
        <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", borderRadius: "24px", padding: "24px", color: "white", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(245,158,11,0.3)", filter: "blur(30px)" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "40px" }}>📈</span>
              <div>
                <p style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>اكتشف عالم التداول</p>
                <p style={{ fontSize: "13px", opacity: 0.7, margin: "4px 0 0 0" }}>افتح حساب واحصل على بونص ترحيبي</p>
              </div>
            </div>
            <span style={{ fontSize: "24px", color: "#f59e0b" }}>→</span>
          </div>
        </div>
      </a>

      {/* Recent Transactions */}
      <div>
        <h2 style={{ color: "#0f172a", fontSize: "20px", fontWeight: 800, margin: "0 0 16px 0" }}>📋 آخر العمليات</h2>
        <div style={{ backgroundColor: "white", borderRadius: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
          {recent.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px", margin: 0 }}>لا توجد عمليات بعد</p>
          ) : (
            recent.map((tx, i) => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: i < recent.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: tx.type === "income" ? "#ecfdf5" : "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    {tx.type === "income" ? "💰" : "💸"}
                  </div>
                  <div>
                    <p style={{ color: "#0f172a", fontSize: "15px", fontWeight: 600, margin: 0 }}>
                      {tx.type === "income" ? "دخل جديد" : tx.description?.substring(0, 20) || "مصروف"}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "12px", margin: "2px 0 0 0" }}>
                      {new Date(tx.createdAt!).toLocaleDateString("ar-TN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <p style={{ color: tx.type === "income" ? "#059669" : "#e11d48", fontSize: "16px", fontWeight: 700, margin: 0 }}>
                  {tx.type === "expense" ? "-" : "+"}{parseFloat(tx.amount).toLocaleString("ar-TN")} {symbol}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}