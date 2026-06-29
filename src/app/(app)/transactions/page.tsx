// src/app/(app)/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, income, expense, trading, charity
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchTransactions(); }, [filter, month, year]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/list?filter=${filter}&month=${month + 1}&year=${year}`);
      const data = await res.json();
      if (res.ok) setTransactions(data.transactions);
    } catch (err) {}
    setLoading(false);
  }

  const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const filters = [
    { value: "all", label: "الكل" },
    { value: "income", label: "💰 دخل" },
    { value: "expense", label: "💸 مصروف" },
    { value: "trading", label: "📈 تداول" },
    { value: "charity", label: "🤲 صدقة" },
  ];

  const totalIncome = transactions.filter(t => t.type === "income" || t.type === "trading_gain").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === "expense" || t.type === "trading_loss").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalCharity = transactions.filter(t => t.description?.includes("صدقة") || t.description?.includes("زكاة")).reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>📋 المعاملات</h1>
      </div>

      {/* Month/Year Selector */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
          style={{ flex: 1, padding: "12px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 600, color: "#0f172a", outline: "none" }}>
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))}
          style={{ width: "90px", padding: "12px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 600, color: "#0f172a", outline: "none", textAlign: "center" }} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{ padding: "8px 14px", borderRadius: "10px", border: filter === f.value ? "2px solid #4f46e5" : "1px solid #e2e8f0", backgroundColor: filter === f.value ? "#eef2ff" : "white", color: filter === f.value ? "#4f46e5" : "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {[
          { label: "الدخل", value: totalIncome, color: "#059669" },
          { label: "المصروف", value: totalExpenses, color: "#dc2626" },
          { label: "الصدقة", value: totalCharity, color: "#7c3aed" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "white", borderRadius: "14px", padding: "14px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
            <p style={{ color: s.color, fontSize: "16px", fontWeight: 800, margin: 0 }}>{s.value.toLocaleString("ar-TN")} د.ت</p>
            <p style={{ color: "#94a3b8", fontSize: "11px", margin: "2px 0 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transactions List */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
        {loading ? <p style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>جاري التحميل...</p> :
         transactions.length === 0 ? <p style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>لا توجد معاملات</p> :
         transactions.map((tx, i) => (
          <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < transactions.length - 1 ? "1px solid #f1f5f9" : "none" }}>
            <div>
              <p style={{ color: "#0f172a", fontSize: "14px", fontWeight: 600, margin: 0 }}>{tx.description?.substring(0, 35) || tx.type}</p>
              <p style={{ color: "#94a3b8", fontSize: "11px", margin: "2px 0 0 0" }}>{new Date(tx.createdAt).toLocaleDateString("ar-TN")}</p>
            </div>
            <p style={{ color: tx.type === "income" || tx.type === "trading_gain" ? "#059669" : "#dc2626", fontSize: "15px", fontWeight: 700, margin: 0 }}>
              {tx.type === "expense" || tx.type === "trading_loss" ? "-" : "+"}{parseFloat(tx.amount).toLocaleString("ar-TN")} د.ت
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}