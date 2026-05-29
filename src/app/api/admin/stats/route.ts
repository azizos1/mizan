// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, wallets, transactions, goals, referralClicks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // تحقق من admin
    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // جلب كل البيانات
    const allUsers = await db.select().from(users);
    const allWallets = await db.select().from(wallets);
    const allTransactions = await db.select().from(transactions);
    const allGoals = await db.select().from(goals);
    const allClicks = await db.select().from(referralClicks);

    return NextResponse.json({
      allUsers,
      allWallets,
      allTransactions,
      allGoals,
      allClicks,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}