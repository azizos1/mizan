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

    const { amount, type, note } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "المبلغ غير صحيح" }, { status: 400 });
    }

    // جلب محفظة الاستثمار
    const [investWallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, session.user.id!), eq(wallets.name, "استثمار")));

    if (!investWallet) {
      return NextResponse.json({ error: "محفظة الاستثمار غير موجودة" }, { status: 400 });
    }

    const currentBalance = parseFloat(investWallet.balance);
    const changeAmount = type === "gain" ? amount : -amount;
    const newBalance = currentBalance + changeAmount;

    // تحديث رصيد الاستثمار
    await db
      .update(wallets)
      .set({ balance: newBalance.toFixed(2) })
      .where(eq(wallets.id, investWallet.id));

    // تسجيل المعاملة
    await db.insert(transactions).values({
      userId: session.user.id!,
      walletId: investWallet.id,
      type: type === "gain" ? "income" : "expense",
      amount: amount.toFixed(2),
      description: `تداول: ${type === "gain" ? "ربح" : "خسارة"} ${amount}$ ${note ? " - " + note : ""}`,
    });

    return NextResponse.json({ message: "تم التسجيل بنجاح", newBalance });
  } catch (error) {
    console.error("Trading error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}