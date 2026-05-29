// src/app/(app)/trading/page.tsx
"use client";

import { useState } from "react";

export default function TradingPage() {
  const [loading, setLoading] = useState(false);
  const referralLink = "https://one.exnessonelink.com/a/50th4knjfc";

  async function handleClick() {
    setLoading(true);
    
    // تسجيل النقرة
    try {
      await fetch("/api/referral/click", { method: "POST" });
    } catch (err) {}

    // فتح الرابط في نافذة جديدة
    window.open(referralLink, "_blank");
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        borderRadius: "32px",
        padding: "40px 24px",
        textAlign: "center",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 150, height: 150, borderRadius: "50%",
          background: "rgba(245,158,11,0.2)", filter: "blur(40px)"
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(59,130,246,0.2)", filter: "blur(40px)"
        }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "56px", margin: "0 0 16px 0" }}>📈</p>
          <h1 style={{ fontSize: "32px", fontWeight: 900, margin: "0 0 12px 0" }}>
            اكتشف عالم التداول
          </h1>
          <p style={{ fontSize: "16px", opacity: 0.8, margin: "0 0 8px 0", lineHeight: 1.6 }}>
            منصة احترافية لتداول العملات والأسهم
          </p>
        </div>
      </div>

      {/* مميزات */}
      <div style={{
        backgroundColor: "white", borderRadius: "24px", padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9"
      }}>
        <h2 style={{ color: "#0f172a", fontSize: "20px", fontWeight: 800, margin: "0 0 20px 0", textAlign: "center" }}>
          لماذا التداول مع إكسنس؟
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { emoji: "⚡", title: "تنفيذ فوري", desc: "سرعة فائقة في تنفيذ الصفقات" },
            { emoji: "🔒", title: "أمان عالي", desc: "منصة مرخصة وآمنة بالكامل" },
            { emoji: "📊", title: "أدوات متقدمة", desc: "رسوم بيانية وتحليلات احترافية" },
            { emoji: "💵", title: "عمولات منخفضة", desc: "أقل عمولات تداول في السوق" },
            { emoji: "📱", title: "تطبيق للجوال", desc: "تداول من أي مكان وفي أي وقت" },
            { emoji: "🎓", title: "تعليم مجاني", desc: "دورات وشروحات للمبتدئين" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{
                minWidth: "44px", height: "44px", borderRadius: "14px",
                backgroundColor: "#f8fafc", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "22px"
              }}>
                {item.emoji}
              </div>
              <div>
                <p style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700, margin: 0 }}>
                  {item.title}
                </p>
                <p style={{ color: "#64748b", fontSize: "13px", margin: "2px 0 0 0" }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={handleClick} disabled={loading} style={{
        width: "100%", padding: "20px",
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "white", border: "none", borderRadius: "20px",
        fontSize: "20px", fontWeight: 900, cursor: "pointer",
        boxShadow: "0 8px 30px rgba(245,158,11,0.4)",
        transition: "transform 0.2s"
      }}>
        {loading ? "⏳ جاري الفتح..." : "🚀 افتح حساب تداول الآن"}
      </button>

      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", margin: 0 }}>
        سجل الآن واحصل على بونص ترحيبي
      </p>

    </div>
  );
}