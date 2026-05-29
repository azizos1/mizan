// src/app/api/transactions/income/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { wallets, transactions, allocationRules } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { amount, incomeType, note } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "المبلغ غير صحيح" },
        { status: 400 }
      );
    }

    // جلب محافظ المستخدم
    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, session.user.id!));

    // جلب قواعد التوزيع
    const [rules] = await db
      .select()
      .from(allocationRules)
      .where(eq(allocationRules.userId, session.user.id!));

    if (!rules) {
      return NextResponse.json(
        { error: "قواعد التوزيع غير موجودة" },
        { status: 400 }
      );
    }

    // النسب المئوية
    const percentages = {
      استثمار: parseFloat(rules.investmentPct) / 100,
      طوارئ: parseFloat(rules.emergencyPct) / 100,
      عائلة: parseFloat(rules.familyPct) / 100,
      صدقة: parseFloat(rules.charityPct) / 100,
    };

    const lifePercentage = 1 - (percentages.استثمار + percentages.طوارئ + percentages.عائلة + percentages.صدقة);

    // دالة مساعدة: إيجاد المحفظة بالاسم
    function findWallet(name: string) {
      return userWallets.find((w) => w.name === name);
    }

    // تحديث الأرصدة وإنشاء المعاملات
    const updates: Promise<any>[] = [];

    // 1. استثمار
    const investWallet = findWallet("استثمار");
    if (investWallet) {
      const investAmount = amount * percentages.استثمار;
      updates.push(
        db.insert(transactions).values({
          userId: session.user.id!,
          walletId: investWallet.id,
          type: "allocation",
          amount: investAmount.toFixed(2),
          description: `توزيع تلقائي من ${incomeType}: ${note || ""}`,
        }),
        db.update(wallets)
          .set({
            balance: (
              parseFloat(investWallet.balance) + investAmount
            ).toFixed(2),
          })
          .where(eq(wallets.id, investWallet.id))
      );
    }

    // 2. طوارئ
    const emergencyWallet = findWallet("طوارئ");
    if (emergencyWallet) {
      const emergencyAmount = amount * percentages.طوارئ;
      updates.push(
        db.insert(transactions).values({
          userId: session.user.id!,
          walletId: emergencyWallet.id,
          type: "allocation",
          amount: emergencyAmount.toFixed(2),
          description: `توزيع تلقائي من ${incomeType}: ${note || ""}`,
        }),
        db.update(wallets)
          .set({
            balance: (
              parseFloat(emergencyWallet.balance) + emergencyAmount
            ).toFixed(2),
          })
          .where(eq(wallets.id, emergencyWallet.id))
      );
    }

    // 3. عائلة
    const familyWallet = findWallet("عائلة");
    if (familyWallet) {
      const familyAmount = amount * percentages.عائلة;
      updates.push(
        db.insert(transactions).values({
          userId: session.user.id!,
          walletId: familyWallet.id,
          type: "allocation",
          amount: familyAmount.toFixed(2),
          description: `توزيع تلقائي من ${incomeType}: ${note || ""}`,
        }),
        db.update(wallets)
          .set({
            balance: (
              parseFloat(familyWallet.balance) + familyAmount
            ).toFixed(2),
          })
          .where(eq(wallets.id, familyWallet.id))
      );
    }

    // 4. صدقة
    const charityWallet = findWallet("صدقة");
    if (charityWallet) {
      const charityAmount = amount * percentages.صدقة;
      updates.push(
        db.insert(transactions).values({
          userId: session.user.id!,
          walletId: charityWallet.id,
          type: "allocation",
          amount: charityAmount.toFixed(2),
          description: `توزيع تلقائي من ${incomeType}: ${note || ""}`,
        }),
        db.update(wallets)
          .set({
            balance: (
              parseFloat(charityWallet.balance) + charityAmount
            ).toFixed(2),
          })
          .where(eq(wallets.id, charityWallet.id))
      );
    }

    // 5. حياة يومية
    const dailyWallet = findWallet("حياة يومية");
    if (dailyWallet) {
      const lifeAmount = amount * lifePercentage;
      updates.push(
        db.insert(transactions).values({
          userId: session.user.id!,
          walletId: dailyWallet.id,
          type: "allocation",
          amount: lifeAmount.toFixed(2),
          description: `توزيع تلقائي من ${incomeType}: ${note || ""}`,
        }),
        db.update(wallets)
          .set({
            balance: (
              parseFloat(dailyWallet.balance) + lifeAmount
            ).toFixed(2),
          })
          .where(eq(wallets.id, dailyWallet.id))
      );
    }

    // 0. تسجيل الدخل الأصلي (في محفظة الحياة اليومية)
    const lifeWallet = findWallet("حياة يومية");
    if (lifeWallet) {
      updates.push(
        db.insert(transactions).values({
          userId: session.user.id!,
          walletId: lifeWallet.id,
          type: "income",
          amount: amount.toFixed(2),
          description: `${incomeType}${note ? ": " + note : ""}`,
        })
      );
    }

    // تنفيذ كل التحديثات
    await Promise.all(updates);

    return NextResponse.json({
      message: "تمت إضافة الدخل وتوزيعه بنجاح",
      amount,
      breakdown: {
        استثمار: (amount * percentages.استثمار).toFixed(2),
        طوارئ: (amount * percentages.طوارئ).toFixed(2),
        عائلة: (amount * percentages.عائلة).toFixed(2),
        صدقة: (amount * percentages.صدقة).toFixed(2),
        حياة_يومية: (amount * lifePercentage).toFixed(2),
      },
    });
  } catch (error) {
    console.error("Income error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة الدخل" },
      { status: 500 }
    );
  }
}