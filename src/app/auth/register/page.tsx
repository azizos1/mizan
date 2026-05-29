// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/auth/login");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚖️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">إنشاء حساب</h1>
          <p className="text-gray-500 text-sm mt-2">ابدأ رحلتك المالية</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 space-y-5">
          {error && (
            <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-gray-400 text-xs mb-2 block">الاسم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/5 rounded-xl py-3 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                placeholder="محمد أحمد"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-2 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/5 rounded-xl py-3 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                placeholder="example@email.com"
                required
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-2 block">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/5 rounded-xl py-3 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                placeholder="••••••••"
                required
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          لديك حساب بالفعل؟{" "}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}