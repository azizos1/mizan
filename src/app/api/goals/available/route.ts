// src/app/api/goals/available/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { wallets, transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = session.user.id!;

    // جلب كل المعاملات
    const allTx = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    // حساب الدخل الشهري (آخر 30 يوم)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyIncome = allTx
      .filter((t) => t.type === "income" && new Date(t.createdAt!) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // حساب المصروفات الشهرية (آخر 30 يوم)
    const monthlyExpenses = allTx
      .filter((t) => t.type === "expense" && new Date(t.createdAt!) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // جلب محفظة الحياة اليومية
    const [lifeWallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.name, "حياة يومية")));

    const lifeBalance = lifeWallet ? parseFloat(lifeWallet.balance) : 0;

    // المبلغ المتاح للأهداف = رصيد الحياة اليومية
    const availableForGoals = lifeBalance;

    return NextResponse.json({
      monthlyIncome,
      monthlyExpenses,
      availableForGoals,
      lifeBalance,
    });
  } catch (error) {
    console.error("Available error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}