// src/app/auth/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Logo Card */}
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "32px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: "48px", margin: "0 0 8px 0" }}>⚖️</p>
          <h1 style={{ color: "#0f172a", fontSize: "28px", fontWeight: 900, margin: 0 }}>ميزان</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "8px 0 0 0" }}>نظام حياتك المالية</p>
        </div>

        {/* Login Form Card */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div style={{ backgroundColor: "#fef2f2", borderRadius: "14px", padding: "14px", textAlign: "center", color: "#dc2626", fontSize: "13px", fontWeight: 500 }}>{error}</div>
          )}

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
            {loading ? "⏳ جاري الدخول..." : "🚀 دخول"}
          </button>
        </form>

        {/* Register Link */}
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          ليس لديك حساب؟{" "}
          <Link href="/auth/register" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>
            إنشاء حساب
          </Link>
        </p>

      </div>
    </div>
  );
}