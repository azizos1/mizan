// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, wallets, allocationRules } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword })
      .returning();

    // إنشاء المحافظ الافتراضية
    const defaultWallets = [
      { name: "استثمار", type: "system", allocationPercentage: "30.00" },
      { name: "طوارئ", type: "system", allocationPercentage: "15.00" },
      { name: "عائلة", type: "system", allocationPercentage: "10.00" },
      { name: "صدقة", type: "system", allocationPercentage: "5.00" },
      { name: "حياة يومية", type: "system", allocationPercentage: "40.00" },
    ];

    for (const wallet of defaultWallets) {
      await db.insert(wallets).values({
        userId: newUser.id,
        name: wallet.name,
        type: wallet.type as any,
        allocationPercentage: wallet.allocationPercentage,
      });
    }

    await db.insert(allocationRules).values({
      userId: newUser.id,
      investmentPct: "30.00",
      emergencyPct: "15.00",
      familyPct: "10.00",
      charityPct: "5.00",
    });

    return NextResponse.json(
      { message: "تم إنشاء الحساب بنجاح", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب: " + (error as Error).message },
      { status: 500 }
    );
  }
}