import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const month = parseInt(searchParams.get("month") || "0");
  const year = parseInt(searchParams.get("year") || "0");

  const allTx = await db.select().from(transactions).where(eq(transactions.userId, session.user.id!));

  let filtered = allTx;

  // فلترة بالشهر
  if (month && year) {
    filtered = filtered.filter((tx) => {
      const d = new Date(tx.createdAt!);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }

  // فلترة بالنوع
  if (filter === "income") filtered = filtered.filter((t) => t.type === "income");
  if (filter === "expense") filtered = filtered.filter((t) => t.type === "expense");
  if (filter === "trading") filtered = filtered.filter((t) => t.type === "trading_gain" || t.type === "trading_loss");
    if (filter === "charity") filtered = filtered.filter((t) => 
    t.type === "expense" && (t.description?.includes("صدقة") || t.description?.includes("زكاة"))
  );

  return NextResponse.json({ transactions: filtered.reverse() });
}