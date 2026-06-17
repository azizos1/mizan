// src/app/(app)/trading-log/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TradingLogPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("gain");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    if (!amount || parseFloat(amount) <= 0) { setError("المبلغ غير صحيح"); setLoading(false); return; }

    try {
      const res = await fetch("/api/transactions/trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطأ"); setLoading(false); return; }

      const sign = type === "gain" ? "+" : "-";
      setSuccess(`${sign}$${parseFloat(amount).toLocaleString("en-US")} في محفظة الاستثمار`);
      setAmount(""); setNote("");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch { setError("خطأ في الاتصال"); } finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Title */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>📈 سجل التداول</h1>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "6px 0 0 0" }}>سجل أرباح وخسائر التداول بالدولار</p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* النوع */}
        <div>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 10px 0" }}>النوع</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={() => setType("gain")}
              style={{ flex: 1, padding: "14px", borderRadius: "14px", border: type === "gain" ? "2px solid #059669" : "1px solid #e2e8f0", backgroundColor: type === "gain" ? "#ecfdf5" : "white", color: type === "gain" ? "#059669" : "#64748b", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
              📈 ربح
            </button>
            <button type="button" onClick={() => setType("loss")}
              style={{ flex: 1, padding: "14px", borderRadius: "14px", border: type === "loss" ? "2px solid #dc2626" : "1px solid #e2e8f0", backgroundColor: type === "loss" ? "#fef2f2" : "white", color: type === "loss" ? "#dc2626" : "#64748b", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
              📉 خسارة
            </button>
          </div>
        </div>

        {/* المبلغ بالدولار */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 10px 0" }}>المبلغ</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <span style={{ color: "#0f172a", fontSize: "32px", fontWeight: 900 }}>$</span>
            <input
              type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              style={{ width: "200px", border: "none", fontSize: "40px", fontWeight: 900, color: "#0f172a", textAlign: "center", outline: "none", background: "transparent" }}
              placeholder="0.00" required dir="ltr"
            />
          </div>
          <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0 0" }}>دولار أمريكي</p>
        </div>

        {/* ملاحظة */}
        <div>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 6px 0" }}>ملاحظة</p>
          <input
            type="text" value={note} onChange={(e) => setNote(e.target.value)}
            style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px 16px", fontSize: "16px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
            placeholder="زوج العملات، سبب الصفقة..."
          />
        </div>

        {error && <div style={{ backgroundColor: "#fef2f2", borderRadius: "14px", padding: "14px", textAlign: "center", color: "#dc2626", fontSize: "13px" }}>{error}</div>}
        {success && <div style={{ backgroundColor: "#ecfdf5", borderRadius: "14px", padding: "14px", textAlign: "center", color: "#059669", fontSize: "13px" }}>{success}</div>}

        <button type="submit" disabled={loading}
          style={{ padding: "16px", backgroundColor: loading ? "#94a3b8" : type === "gain" ? "#059669" : "#dc2626", color: "white", border: "none", borderRadius: "16px", fontSize: "18px", fontWeight: 700, cursor: "pointer" }}>
          {loading ? "⏳ جاري..." : "💾 تسجيل"}
        </button>
      </form>
    </div>
  );
}