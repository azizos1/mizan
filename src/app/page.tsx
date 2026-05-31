// src/app/page.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px", paddingTop: "60px" }}>

        {/* Logo */}
        <div style={{ backgroundColor: "white", borderRadius: "32px", padding: "40px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: "64px", margin: "0 0 12px 0" }}>⚖️</p>
          <h1 style={{ color: "#0f172a", fontSize: "36px", fontWeight: 900, margin: 0 }}>ميزان</h1>
          <p style={{ color: "#64748b", fontSize: "16px", margin: "12px 0 0 0", lineHeight: 1.6 }}>
            نظام حياة مالي ذكي يساعدك على تقسيم دخلك تلقائياً،<br />
            بناء ثروتك، والتحكم في مصروفاتك.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {[
            { emoji: "📦", title: "توزيع تلقائي", desc: "دخلك يتقسم على 5 محافظ" },
            { emoji: "🧠", title: "تتبع عاطفي", desc: "افهم عاداتك المالية" },
            { emoji: "📊", title: "تقارير ذكية", desc: "تحليلات ونصائح" },
          ].map((f) => (
            <div key={f.title} style={{ backgroundColor: "white", borderRadius: "20px", padding: "20px 14px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
              <p style={{ fontSize: "32px", margin: "0 0 8px 0" }}>{f.emoji}</p>
              <p style={{ color: "#0f172a", fontSize: "14px", fontWeight: 700, margin: 0 }}>{f.title}</p>
              <p style={{ color: "#94a3b8", fontSize: "11px", margin: "4px 0 0 0" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/auth/register" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "#4f46e5", borderRadius: "18px", padding: "18px", textAlign: "center", color: "white", fontSize: "18px", fontWeight: 700 }}>
              🚀 ابدأ مجاناً
            </div>
          </Link>
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "white", borderRadius: "18px", padding: "18px", textAlign: "center", color: "#4f46e5", fontSize: "18px", fontWeight: 700, border: "1px solid #e2e8f0" }}>
              🔑 تسجيل الدخول
            </div>
          </Link>
        </div>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", margin: 0 }}>ميزان © 2025</p>

      </div>
    </div>
  );
}