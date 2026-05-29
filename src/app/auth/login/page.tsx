// src/app/auth/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚖️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">ميزان</h1>
          <p className="text-gray-500 text-sm mt-2">نظام حياتك المالية</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 space-y-5">
          {error && (
            <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

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
            <LogIn className="w-4 h-4" />
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          ليس لديك حساب؟{" "}
          <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  );
}