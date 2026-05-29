// src/app/api/reports/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { wallets, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = session.user.id!;

    // جلب المحافظ
    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));

    // جلب كل المعاملات
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    // ✅ حساب الدخل: نجمع type = 'income' فقط
    const totalIncome = allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // ✅ حساب المصروفات: type = 'expense' فقط
    const expenseTransactions = allTransactions.filter(
      (t) => t.type === "expense"
    );

    let totalExpenses = 0;
    let emotionalExpenses = 0;
    const expensesByCategoryMap: Record<string, number> = {};

    expenseTransactions.forEach((t) => {
      const amount = parseFloat(t.amount);
      totalExpenses += amount;

      const category = t.description?.split(":")[0] || "أخرى";
      expensesByCategoryMap[category] =
        (expensesByCategoryMap[category] || 0) + amount;

      if (
        t.emotionalState === "impulsive" ||
        t.emotionalState === "stressed"
      ) {
        emotionalExpenses += amount;
      }
    });

    const expensesByCategory = Object.entries(expensesByCategoryMap).map(
      ([name, value]) => ({ name, value: Math.round(value * 100) / 100 })
    );

    // توزيع المحافظ
    const walletDistribution = userWallets
      .filter((w) => w.type === "system")
      .map((w) => ({
        name: w.name,
        value: Math.round(parseFloat(w.balance) * 100) / 100,
      }));

    // معدل الادخار
    const totalInvested = userWallets
      .filter((w) => w.name === "استثمار" || w.name === "طوارئ")
      .reduce((sum, w) => sum + parseFloat(w.balance), 0);

    const savingsRate =
      totalIncome > 0 ? Math.round((totalInvested / totalIncome) * 100) : 0;

    // نصائح
    const tips: string[] = [];

    if (totalExpenses > 0 && emotionalExpenses > totalExpenses * 0.3) {
      tips.push(
        "أكثر من 30% من مصروفاتك عاطفية. حاول التأني قبل الشراء عندما تكون متوترًا."
      );
    }

    if (totalIncome > 0 && savingsRate < 30) {
      tips.push(
        "معدل ادخارك أقل من 30%. حاول زيادة نسبة الاستثمار والطوارئ."
      );
    }

    if (totalIncome > 0 && totalExpenses > totalIncome) {
      tips.push("مصروفاتك تتجاوز دخلك. هذا يحتاج إلى مراجعة فورية.");
    }

    if (totalIncome > 0 && savingsRate >= 50) {
      tips.push("ممتاز! معدل ادخارك أكثر من 50%. أنت على الطريق الصحيح.");
    }

    if (tips.length === 0) {
      tips.push("أداؤك المالي متوازن. استمر على هذا المنوال!");
    }

    return NextResponse.json({
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      emotionalExpenses: Math.round(emotionalExpenses * 100) / 100,
      savingsRate,
      walletDistribution,
      expensesByCategory,
      tips,
    });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}