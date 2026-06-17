"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["🍔 أكل", "☕ قهوة", "🚗 تنقل", "🛍️ تسوق", "📄 فواتير", "🎮 ترفيه", "🏥 صحة", "📦 أخرى"];
const walletTypes = ["حياة يومية", "استثمار", "طوارئ", "عائلة", "صدقة"];
const moods = [
  { value: "needed", label: "👍 أحتاجه", color: "#059669", bg: "#ecfdf5" },
  { value: "impulsive", label: "😬 مندفع", color: "#d97706", bg: "#fffbeb" },
  { value: "stressed", label: "😔 متوتر", color: "#dc2626", bg: "#fef2f2" },
];

export default function AddExpensePage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("🍔 أكل");
  const [walletType, setWalletType] = useState("حياة يومية");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    if (!amount || parseFloat(amount) <= 0) { setError("المبلغ غير صحيح"); setLoading(false); return; }
    try {
      const res = await fetch("/api/transactions/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), category, walletType, note, emotionalState: mood }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطأ"); setLoading(false); return; }
      setSuccess(data.warning || `تم تسجيل ${parseFloat(amount).toLocaleString("ar-TN")} د.ت من ${walletType}`);
      setAmount(""); setNote(""); setMood("");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch { setError("خطأ في الاتصال"); } finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Title */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>➖ إضافة مصروف</h1>
      </div>

      {/* Wallet Select - الجديد */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>من محفظة</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {walletTypes.map((w) => (
            <button
              key={w}
              onClick={() => setWalletType(w)}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: walletType === w ? "2px solid #dc2626" : "1px solid #e2e8f0",
                backgroundColor: walletType === w ? "#fef2f2" : "white",
                color: walletType === w ? "#dc2626" : "#64748b",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", textAlign: "center" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>المبلغ</p>
        <input
          type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", border: "none", fontSize: "40px", fontWeight: 900, color: "#0f172a", textAlign: "center", outline: "none", background: "transparent" }}
          placeholder="0.000" required
        />
      </div>

      {/* Category */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>الفئة</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "10px 6px",
                borderRadius: "12px",
                border: category === cat ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                backgroundColor: category === cat ? "#eef2ff" : "white",
                color: category === cat ? "#4f46e5" : "#64748b",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>كيف تشعر؟</p>
        <div style={{ display: "flex", gap: "8px" }}>
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? "" : m.value)}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: mood === m.value ? `2px solid ${m.color}` : "1px solid #e2e8f0",
                backgroundColor: mood === m.value ? m.bg : "white",
                color: mood === m.value ? m.color : "#64748b",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                flex: 1
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <input
          type="text" value={note} onChange={(e) => setNote(e.target.value)}
          style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px 16px", fontSize: "16px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
          placeholder="ملاحظة (اختياري)"
        />
      </div>

      {/* Messages */}
      {error && <div style={{ backgroundColor: "#fef2f2", borderRadius: "16px", padding: "16px", textAlign: "center", color: "#dc2626", fontSize: "14px" }}>{error}</div>}
      {success && <div style={{ backgroundColor: "#ecfdf5", borderRadius: "16px", padding: "16px", textAlign: "center", color: "#059669", fontSize: "14px" }}>{success}</div>}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading} style={{
        width: "100%", padding: "18px", backgroundColor: loading ? "#94a3b8" : "#dc2626", color: "white",
        border: "none", borderRadius: "18px", fontSize: "18px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
      }}>
        {loading ? "⏳ جاري..." : "➖ تسجيل المصروف"}
      </button>
    </div>
  );
}