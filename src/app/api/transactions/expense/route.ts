// src/app/api/transactions/expense/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { wallets, transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { amount, category, walletType, note, emotionalState } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "المبلغ غير صحيح" }, { status: 400 });
    }

    // البحث عن المحفظة
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, session.user.id!),
          eq(wallets.name, walletType)
        )
      );

    if (!wallet) {
      return NextResponse.json({ error: "المحفظة غير موجودة" }, { status: 400 });
    }

    const currentBalance = parseFloat(wallet.balance);

    if (currentBalance < amount) {
      return NextResponse.json(
        { error: `الرصيد غير كافٍ. المتوفر: ${currentBalance.toLocaleString("ar-TN")} د.ت` },
        { status: 400 }
      );
    }

    // إنشاء معاملة المصروف
    await db.insert(transactions).values({
      userId: session.user.id!,
      walletId: wallet.id,
      type: "expense",
      amount: amount.toFixed(2),
      description: `${category}${note ? ": " + note : ""}`,
      emotionalState: emotionalState || null,
    });

    // تحديث رصيد المحفظة
    await db
      .update(wallets)
      .set({
        balance: (currentBalance - amount).toFixed(2),
      })
      .where(eq(wallets.id, wallet.id));

    const newBalance = currentBalance - amount;

    // تحذير إذا كان الرصيد منخفض
    let warning = "";
    if (walletType === "حياة يومية" && newBalance < 100) {
      warning = "تنبيه: رصيد الحياة اليومية منخفض (أقل من 100 د.ت). حاول ترشيد المصروفات.";
    }

    // تحذير إذا كان شراء عاطفي
    if (emotionalState === "impulsive" || emotionalState === "stressed") {
      warning = "⚠️ تم تسجيل هذا كمصروف عاطفي. راقب مشاعرك المالية. " + warning;
    }

    return NextResponse.json({
      message: "تم تسجيل المصروف بنجاح",
      newBalance,
      warning: warning || undefined,
    });
  } catch (error) {
    console.error("Expense error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل المصروف" },
      { status: 500 }
    );
  }
}