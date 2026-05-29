// src/app/api/settings/rules/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { allocationRules } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const [rules] = await db
      .select()
      .from(allocationRules)
      .where(eq(allocationRules.userId, session.user.id!));

    return NextResponse.json({ rules });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { investment, emergency, family, charity } = await request.json();

    const total = investment + emergency + family + charity;
    if (total > 100) {
      return NextResponse.json(
        { error: "مجموع النسب لا يمكن أن يتجاوز 100%" },
        { status: 400 }
      );
    }

    await db
      .update(allocationRules)
      .set({
        investmentPct: investment.toString(),
        emergencyPct: emergency.toString(),
        familyPct: family.toString(),
        charityPct: charity.toString(),
        updatedAt: new Date(),
      })
      .where(eq(allocationRules.userId, session.user.id!));

    return NextResponse.json({ message: "تم التحديث بنجاح" });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}