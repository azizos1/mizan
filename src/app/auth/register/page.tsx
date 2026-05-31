// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "حدث خطأ"); setLoading(false); return; }

      const signInResult = await signIn("credentials", { email, password, redirect: false });
      if (signInResult?.error) { router.push("/auth/login"); }
      else { router.push("/dashboard"); }
    } catch { setError("حدث خطأ في الاتصال"); setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "20px" }}>

        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "32px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: "48px", margin: "0 0 8px 0" }}>⚖️</p>
          <h1 style={{ color: "#0f172a", fontSize: "28px", fontWeight: 900, margin: 0 }}>إنشاء حساب</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "8px 0 0 0" }}>ابدأ رحلتك المالية</p>
        </div>

        <form onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && <div style={{ backgroundColor: "#fef2f2", borderRadius: "14px", padding: "14px", textAlign: "center", color: "#dc2626", fontSize: "13px" }}>{error}</div>}

          <div>
            <label style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px", display: "block" }}>الاسم</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px 16px", fontSize: "16px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              placeholder="محمد أحمد" required />
          </div>

          <div>
            <label style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px", display: "block" }}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px 16px", fontSize: "16px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              placeholder="example@email.com" required dir="ltr" />
          </div>

          <div>
            <label style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px", display: "block" }}>كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px 16px", fontSize: "16px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              placeholder="••••••••" required dir="ltr" />
          </div>

          <button type="submit" disabled={loading}
            style={{ padding: "16px", backgroundColor: loading ? "#94a3b8" : "#4f46e5", color: "white", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "⏳ جاري الإنشاء..." : "✅ إنشاء حساب"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          لديك حساب بالفعل؟{" "}
          <Link href="/auth/login" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>تسجيل الدخول</Link>
        </p>

      </div>
    </div>
  );
}