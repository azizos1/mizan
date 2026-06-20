// src/app/(app)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  // نسب التوزيع
  const [investment, setInvestment] = useState(30);
  const [emergency, setEmergency] = useState(15);
  const [family, setFamily] = useState(10);
  const [charity, setCharity] = useState(5);
  
  // العملة
  const [currency, setCurrency] = useState("TND");
  const [currencySymbol, setCurrencySymbol] = useState("د.ت");
  
  // سعر صرف الدولار
  const [usdRate, setUsdRate] = useState("3.1");
  
  // اللغة
  const [language, setLanguage] = useState("ar");
  
  // حدود الإنفاق اليومي
  const [dailyLimit, setDailyLimit] = useState("");
  
  // هدف الطوارئ
  const [emergencyGoal, setEmergencyGoal] = useState("3000");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/rules");
        const data = await res.json();
        if (data.rules) {
          setInvestment(parseFloat(data.rules.investmentPct));
          setEmergency(parseFloat(data.rules.emergencyPct));
          setFamily(parseFloat(data.rules.familyPct));
          setCharity(parseFloat(data.rules.charityPct));
        }
      } catch (err) {}
      
      // تحميل الإعدادات المحفوظة محلياً
      const saved = localStorage.getItem("mizan_settings");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.currency) setCurrency(s.currency);
        if (s.currencySymbol) setCurrencySymbol(s.currencySymbol);
        if (s.usdRate) setUsdRate(s.usdRate);
        if (s.language) setLanguage(s.language);
        if (s.dailyLimit) setDailyLimit(s.dailyLimit);
        if (s.emergencyGoal) setEmergencyGoal(s.emergencyGoal);
      }
    }
    fetchSettings();
  }, []);

  const life = 100 - (investment + emergency + family + charity);
  const isValid = life >= 0;

  async function handleSave() {
    setLoading(true); setError(""); setSuccess("");
    if (!isValid) { setError("مجموع النسب يتجاوز 100%"); setLoading(false); return; }

    try {
      // حفظ نسب التوزيع في السيرفر
      const res = await fetch("/api/settings/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investment, emergency, family, charity }),
      });
      if (!res.ok) { setError("خطأ في حفظ النسب"); setLoading(false); return; }
    } catch { setError("خطأ"); setLoading(false); return; }

    // حفظ باقي الإعدادات محلياً
    const settings = { currency, currencySymbol, usdRate, language, dailyLimit, emergencyGoal };
    localStorage.setItem("mizan_settings", JSON.stringify(settings));

    setSuccess("تم حفظ جميع الإعدادات بنجاح");
    setLoading(false);
  }

  const currencies = [
    { value: "TND", symbol: "د.ت", label: "🇹🇳 دينار تونسي" },
    { value: "USD", symbol: "$", label: "🇺🇸 دولار أمريكي" },
    { value: "EUR", symbol: "€", label: "🇪🇺 يورو" },
    { value: "LYD", symbol: "ل.د", label: "🇱🇾 دينار ليبي" },
    { value: "DZD", symbol: "د.ج", label: "🇩🇿 دينار جزائري" },
    { value: "MAD", symbol: "د.م", label: "🇲🇦 درهم مغربي" },
  ];

  const languages = [
    { value: "ar", label: "🇸🇦 العربية" },
    { value: "fr", label: "🇫🇷 Français" },
    { value: "en", label: "🇬🇧 English" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Header */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>⚙️ الإعدادات</h1>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "6px 0 0 0" }}>خصص تطبيقك حسب احتياجاتك</p>
      </div>

      {/* العملة */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h2 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 700, margin: "0 0 14px 0" }}>💱 العملة</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          {currencies.map((c) => (
            <button key={c.value} onClick={() => { setCurrency(c.value); setCurrencySymbol(c.symbol); }}
              style={{ padding: "12px", borderRadius: "12px", border: currency === c.value ? "2px solid #4f46e5" : "1px solid #e2e8f0", backgroundColor: currency === c.value ? "#eef2ff" : "white", color: currency === c.value ? "#4f46e5" : "#64748b", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* سعر صرف الدولار */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h2 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0" }}>💵 سعر صرف الدولار</h2>
        <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 12px 0" }}>يستخدم في تحويل أرباح/خسائر التداول</p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#0f172a", fontWeight: 700 }}>1 $ =</span>
          <input type="number" step="0.01" value={usdRate} onChange={(e) => setUsdRate(e.target.value)}
            style={{ width: "100px", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", fontSize: "16px", fontWeight: 700, color: "#0f172a", outline: "none", textAlign: "center" }} />
          <span style={{ color: "#64748b" }}>{currencySymbol}</span>
        </div>
      </div>

      {/* اللغة */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h2 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 700, margin: "0 0 14px 0" }}>🌐 اللغة</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {languages.map((l) => (
            <button key={l.value} onClick={() => setLanguage(l.value)}
              style={{ flex: 1, padding: "12px", borderRadius: "12px", border: language === l.value ? "2px solid #4f46e5" : "1px solid #e2e8f0", backgroundColor: language === l.value ? "#eef2ff" : "white", color: language === l.value ? "#4f46e5" : "#64748b", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* نسب التوزيع */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h2 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 700, margin: "0 0 14px 0" }}>📊 نسب التوزيع</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "📈 استثمار", value: investment, set: setInvestment, color: "#059669" },
            { label: "🛡️ طوارئ", value: emergency, set: setEmergency, color: "#d97706" },
            { label: "👨‍👩‍👧‍👦 عائلة", value: family, set: setFamily, color: "#2563eb" },
            { label: "🤲 صدقة", value: charity, set: setCharity, color: "#7c3aed" },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: item.color, fontSize: "16px", fontWeight: 800 }}>{item.value}%</span>
              </div>
              <input type="range" min="0" max="100" value={item.value} onChange={(e) => item.set(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: item.color }} />
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "14px", padding: "14px", display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>🏠 حياة يومية</span>
          <span style={{ color: life < 0 ? "#dc2626" : "#0f172a", fontSize: "18px", fontWeight: 800 }}>{life}%</span>
        </div>
      </div>

      {/* حدود الإنفاق */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h2 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0" }}>🚫 حد الإنفاق اليومي</h2>
        <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 12px 0" }}>سيظهر تنبيه عند تجاوز هذا الحد</p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)}
            style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", fontSize: "16px", color: "#0f172a", outline: "none" }}
            placeholder="مثلاً: 50" />
          <span style={{ color: "#64748b" }}>{currencySymbol}</span>
        </div>
      </div>

      {/* هدف الطوارئ */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <h2 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0" }}>🎯 هدف صندوق الطوارئ</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="number" value={emergencyGoal} onChange={(e) => setEmergencyGoal(e.target.value)}
            style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", fontSize: "16px", color: "#0f172a", outline: "none" }}
            placeholder="3000" />
          <span style={{ color: "#64748b" }}>{currencySymbol}</span>
        </div>
      </div>

      {error && <div style={{ backgroundColor: "#fef2f2", borderRadius: "14px", padding: "14px", textAlign: "center", color: "#dc2626", fontSize: "13px" }}>{error}</div>}
      {success && <div style={{ backgroundColor: "#ecfdf5", borderRadius: "14px", padding: "14px", textAlign: "center", color: "#059669", fontSize: "13px" }}>{success}</div>}

      <button onClick={handleSave} disabled={loading || !isValid}
        style={{ padding: "16px", backgroundColor: loading || !isValid ? "#94a3b8" : "#059669", color: "white", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
        {loading ? "⏳ جاري الحفظ..." : "💾 حفظ جميع الإعدادات"}
      </button>

    </div>
  );
}