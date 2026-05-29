"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddIncomePage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const quickAmounts = [50, 100, 200, 500, 1000];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    if (!amount || parseFloat(amount) <= 0) { setError("المبلغ غير صحيح"); setLoading(false); return; }
    try {
      const res = await fetch("/api/transactions/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), incomeType: "دخل", note }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطأ"); setLoading(false); return; }
      setSuccess(`تمت إضافة ${parseFloat(amount).toLocaleString("ar-TN")} د.ت`);
      setAmount(""); setNote("");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch { setError("خطأ في الاتصال"); } finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* CARD 1: Title */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>➕ إضافة دخل</h1>
      </div>

      {/* CARD 2: Quick Amounts */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>مبالغ سريعة</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {quickAmounts.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q.toString())}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: amount === q.toString() ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                backgroundColor: amount === q.toString() ? "#eef2ff" : "white",
                color: amount === q.toString() ? "#4f46e5" : "#64748b",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {q} د.ت
            </button>
          ))}
        </div>
      </div>

      {/* CARD 3: Amount Input */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", textAlign: "center" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>المبلغ</p>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            border: "none",
            fontSize: "40px",
            fontWeight: 900,
            color: "#0f172a",
            textAlign: "center",
            outline: "none",
            background: "transparent"
          }}
          placeholder="0.000"
          required
        />
      </div>

      {/* CARD 4: Note */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "14px 16px",
            fontSize: "16px",
            color: "#0f172a",
            outline: "none",
            boxSizing: "border-box"
          }}
          placeholder="ملاحظة (اختياري)"
        />
      </div>

      {/* CARD 5: Distribution Preview */}
      {amount && parseFloat(amount) > 0 && (
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 16px 0" }}>سيتم التوزيع:</p>
          {[
            { label: "استثمار 30%", color: "#059669" },
            { label: "طوارئ 15%", color: "#d97706" },
            { label: "عائلة 10%", color: "#2563eb" },
            { label: "صدقة 5%", color: "#7c3aed" },
            { label: "حياة يومية 40%", color: "#64748b" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid #f1f5f9" : "none" }}>
              <span style={{ color: item.color, fontSize: "14px", fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: "#64748b", fontSize: "14px" }}>
                {(parseFloat(amount) * [0.3, 0.15, 0.1, 0.05, 0.4][i]).toLocaleString("ar-TN")} د.ت
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div style={{ backgroundColor: "#fef2f2", borderRadius: "16px", padding: "16px", textAlign: "center", color: "#dc2626", fontSize: "14px", fontWeight: 500 }}>{error}</div>
      )}
      {success && (
        <div style={{ backgroundColor: "#ecfdf5", borderRadius: "16px", padding: "16px", textAlign: "center", color: "#059669", fontSize: "14px", fontWeight: 500 }}>{success}</div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "18px",
          backgroundColor: loading ? "#94a3b8" : "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "18px",
          fontSize: "18px",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "⏳ جاري..." : "➕ إضافة وتوزيع"}
      </button>

    </div>
  );
}