import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { wallets, transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// سعر الصرف: 1 دولار = 3.1 دينار تونسي
const USD_TO_TND = 3.1;

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

    // تحويل المبلغ للدينار
    const amountInTND = amount * USD_TO_TND;

    // جلب محفظة الاستثمار
    const [investWallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, session.user.id!), eq(wallets.name, "استثمار")));

    if (!investWallet) {
      return NextResponse.json({ error: "محفظة الاستثمار غير موجودة" }, { status: 400 });
    }

    const currentBalance = parseFloat(investWallet.balance);
    const changeAmount = type === "gain" ? amountInTND : -amountInTND;
    const newBalance = currentBalance + changeAmount;

    // تحديث رصيد الاستثمار
    await db
      .update(wallets)
      .set({ balance: newBalance.toFixed(2) })
      .where(eq(wallets.id, investWallet.id));

    // تسجيل المعاملة بنوع trading_gain أو trading_loss
    await db.insert(transactions).values({
      userId: session.user.id!,
      walletId: investWallet.id,
      type: type === "gain" ? "trading_gain" : "trading_loss",
      amount: amountInTND.toFixed(2),
      description: `تداول: ${type === "gain" ? "ربح" : "خسارة"} $${amount} (${amountInTND.toFixed(2)} د.ت) ${note ? " - " + note : ""}`,
    });

    return NextResponse.json({
      message: `تم تسجيل ${type === "gain" ? "ربح" : "خسارة"} $${amount} = ${amountInTND.toFixed(2)} د.ت`,
      newBalance
    });
  } catch (error) {
    console.error("Trading error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}