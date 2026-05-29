"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [investment, setInvestment] = useState(30);
  const [emergency, setEmergency] = useState(15);
  const [family, setFamily] = useState(10);
  const [charity, setCharity] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const life = 100 - (investment + emergency + family + charity);
  const isValid = life >= 0;

  useEffect(() => {
    async function fetchRules() {
      const res = await fetch("/api/settings/rules");
      const data = await res.json();
      if (data.rules) {
        setInvestment(parseFloat(data.rules.investmentPct));
        setEmergency(parseFloat(data.rules.emergencyPct));
        setFamily(parseFloat(data.rules.familyPct));
        setCharity(parseFloat(data.rules.charityPct));
      }
    }
    fetchRules();
  }, []);

  async function handleSave() {
    setLoading(true); setError(""); setSuccess("");
    if (!isValid) { setError("مجموع النسب يتجاوز 100%"); setLoading(false); return; }
    try {
      const res = await fetch("/api/settings/rules", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ investment, emergency, family, charity }) });
      const data = await res.json();
      if (!res.ok) setError(data.error); else setSuccess("تم الحفظ بنجاح");
    } catch { setError("خطأ"); } finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>⚙️ الإعدادات</h1>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "20px" }}>
        <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: 0 }}>نسب التوزيع</h2>

        {[
          { label: "📈 استثمار", value: investment, set: setInvestment, color: "#059669" },
          { label: "🛡️ طوارئ", value: emergency, set: setEmergency, color: "#d97706" },
          { label: "👨‍👩‍👧‍👦 عائلة", value: family, set: setFamily, color: "#2563eb" },
          { label: "🤲 صدقة", value: charity, set: setCharity, color: "#7c3aed" },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#0f172a", fontSize: "14px", fontWeight: 600 }}>{item.label}</span>
              <span style={{ color: item.color, fontSize: "16px", fontWeight: 800 }}>{item.value}%</span>
            </div>
            <input type="range" min="0" max="100" value={item.value} onChange={(e) => item.set(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: item.color }} />
          </div>
        ))}

        <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "16px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>🏠 حياة يومية</span>
          <span style={{ color: life < 0 ? "#dc2626" : "#0f172a", fontSize: "18px", fontWeight: 800 }}>{life}%</span>
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}>{error}</p>}
        {success && <p style={{ color: "#059669", fontSize: "13px", margin: 0 }}>{success}</p>}

        <button onClick={handleSave} disabled={loading || !isValid} style={{
          padding: "16px", backgroundColor: loading || !isValid ? "#94a3b8" : "#059669", color: "white",
          border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: 700, cursor: loading || !isValid ? "not-allowed" : "pointer"
        }}>
          {loading ? "⏳" : "💾 حفظ"}
        </button>
      </div>
    </div>
  );
}