"use client";

import { useState, useEffect } from "react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        const result = await res.json();
        if (res.ok) setData(result);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchReports();
  }, []);

  if (loading) return <p style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>جاري التحميل...</p>;
  if (!data) return <p style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>لا توجد بيانات</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>📊 التقارير</h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {[
          { label: "إجمالي الدخل", value: data.totalIncome, color: "#059669", emoji: "💰" },
          { label: "إجمالي المصروفات", value: data.totalExpenses, color: "#dc2626", emoji: "💸" },
          { label: "معدل الادخار", value: data.savingsRate + "%", color: "#2563eb", emoji: "🏦" },
          { label: "مصروفات عاطفية", value: data.emotionalExpenses, color: "#d97706", emoji: "😔" },
        ].map((stat) => (
          <div key={stat.label} style={{
            backgroundColor: "white", borderRadius: "20px", padding: "20px", textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9"
          }}>
            <p style={{ fontSize: "28px", margin: "0 0 8px 0" }}>{stat.emoji}</p>
            <p style={{ color: stat.color, fontSize: "22px", fontWeight: 800, margin: 0 }}>
              {typeof stat.value === "number" ? stat.value.toLocaleString("ar-TN") : stat.value}
            </p>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0 0" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Wallet Distribution */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: "0 0 16px 0" }}>🏦 توزيع المحافظ</h2>
        {data.walletDistribution.map((w: any, i: number) => {
          const maxVal = Math.max(...data.walletDistribution.map((x: any) => x.value), 1);
          const barWidth = (w.value / maxVal) * 100;
          const colors = ["#059669", "#d97706", "#2563eb", "#7c3aed", "#64748b"];
          return (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "#0f172a", fontSize: "14px", fontWeight: 500 }}>{w.name}</span>
                <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>{w.value.toLocaleString("ar-TN")} د.ت</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "#f1f5f9", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${barWidth}%`, backgroundColor: colors[i], borderRadius: "8px" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expenses by Category */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: "0 0 16px 0" }}>💸 المصروفات حسب الفئة</h2>
        {data.expensesByCategory.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center" }}>لا توجد بيانات</p>
        ) : (
          data.expensesByCategory.map((cat: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < data.expensesByCategory.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <span style={{ color: "#0f172a", fontSize: "14px" }}>{cat.name}</span>
              <span style={{ color: "#dc2626", fontSize: "14px", fontWeight: 600 }}>{cat.value.toLocaleString("ar-TN")} د.ت</span>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      {data.tips && data.tips.length > 0 && (
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: "0 0 12px 0" }}>💡 نصائح</h2>
          {data.tips.map((tip: string, i: number) => (
            <p key={i} style={{ color: "#64748b", fontSize: "14px", margin: "8px 0", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}