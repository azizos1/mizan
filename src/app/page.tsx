// src/app/page.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, TrendingUp, Brain, BarChart3 } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-lg mx-auto px-4 pt-20 pb-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚖️</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">ميزان</h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-10">
          نظام حياة مالي ذكي يساعدك على تقسيم دخلك تلقائيًا،<br />
          بناء ثروتك، والتحكم في مصروفاتك.
        </p>

        <div className="flex gap-3 justify-center mb-16">
          <Link href="/auth/register" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-2xl transition">
            ابدأ مجانًا
          </Link>
          <Link href="/auth/login" className="bg-[#1a1a2e] border border-white/10 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-2xl transition">
            تسجيل الدخول
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, title: "توزيع تلقائي", desc: "دخلك يتقسم على 5 محافظ" },
            { icon: Brain, title: "تتبع عاطفي", desc: "افهم عاداتك المالية" },
            { icon: BarChart3, title: "تقارير ذكية", desc: "تحليلات ونصائح مخصصة" },
          ].map((f, i) => (
            <div key={i} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-white text-sm font-semibold">{f.title}</p>
              <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-8 text-gray-600 text-xs">
        ميزان © 2025
      </footer>
    </div>
  );
}