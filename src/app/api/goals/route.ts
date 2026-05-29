// src/app/api/goals/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { goals, wallets, transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, session.user.id!));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goalsWithDetails = await Promise.all(
      userGoals.map(async (goal) => {
        let currentAmount = 0;
        if (goal.walletId) {
          const [wallet] = await db
            .select()
            .from(wallets)
            .where(eq(wallets.id, goal.walletId));
          if (wallet) {
            currentAmount = parseFloat(wallet.balance);
          }
        }

        const target = parseFloat(goal.targetAmount);
        const percentage = target > 0 ? Math.round((currentAmount / target) * 100) : 0;
        const remaining = target - currentAmount;

        let dailyNeeded: number | null = null;
        let daysLeft: number | null = null;

        if (goal.targetDate && remaining > 0) {
          const targetDate = new Date(goal.targetDate);
          targetDate.setHours(23, 59, 59, 0);
          const diffTime = targetDate.getTime() - today.getTime();
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (daysLeft > 0) {
            dailyNeeded = Math.ceil((remaining / daysLeft) * 100) / 100;
          }
        }

        return {
          id: goal.id,
          name: goal.name,
          targetAmount: target,
          targetDate: goal.targetDate,
          currentAmount,
          percentage: Math.min(percentage, 100),
          dailyNeeded,
          daysLeft,
        };
      })
    );

    return NextResponse.json({ goals: goalsWithDetails });
  } catch (error) {
    console.error("Goals error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { name, targetAmount, targetDate } = await request.json();

    if (!name || !targetAmount || targetAmount <= 0) {
      return NextResponse.json(
        { error: "الرجاء إدخال اسم وهدف صحيح" },
        { status: 400 }
      );
    }

    const [wallet] = await db
      .insert(wallets)
      .values({
        userId: session.user.id!,
        name: `هدف: ${name}`,
        type: "goal",
        balance: "0.00",
      })
      .returning();

    const [goal] = await db
      .insert(goals)
      .values({
        userId: session.user.id!,
        walletId: wallet.id,
        name,
        targetAmount: targetAmount.toFixed(2),
        targetDate: targetDate || null,
      })
      .returning();

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الهدف" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { goalId, amount } = await request.json();

    if (!goalId || !amount || amount <= 0) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, session.user.id!)));

    if (!goal) {
      return NextResponse.json({ error: "الهدف غير موجود" }, { status: 404 });
    }

    if (!goal.walletId) {
      return NextResponse.json({ error: "المحفظة غير موجودة" }, { status: 400 });
    }

    const [goalWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, goal.walletId));

    if (!goalWallet) {
      return NextResponse.json({ error: "المحفظة غير موجودة" }, { status: 400 });
    }

    const [lifeWallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, session.user.id!), eq(wallets.name, "حياة يومية")));

    if (!lifeWallet || parseFloat(lifeWallet.balance) < amount) {
      return NextResponse.json(
        { error: "رصيد الحياة اليومية غير كافٍ" },
        { status: 400 }
      );
    }

    await db
      .update(wallets)
      .set({ balance: (parseFloat(lifeWallet.balance) - amount).toFixed(2) })
      .where(eq(wallets.id, lifeWallet.id));

    await db
      .update(wallets)
      .set({ balance: (parseFloat(goalWallet.balance) + amount).toFixed(2) })
      .where(eq(wallets.id, goalWallet.id));

    await db.insert(transactions).values({
      userId: session.user.id!,
      walletId: goalWallet.id,
      type: "goal_contribution",
      amount: amount.toFixed(2),
      description: `تمويل هدف: ${goal.name}`,
    });

    await db.insert(transactions).values({
      userId: session.user.id!,
      walletId: lifeWallet.id,
      type: "expense",
      amount: amount.toFixed(2),
      description: `تحويل لهدف: ${goal.name}`,
    });

    return NextResponse.json({ message: "تم التمويل بنجاح" });
  } catch (error) {
    console.error("Fund goal error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { goalId, name, targetAmount, targetDate } = await request.json();

    if (!goalId) {
      return NextResponse.json({ error: "معرف الهدف مطلوب" }, { status: 400 });
    }

    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, session.user.id!)));

    if (!goal) {
      return NextResponse.json({ error: "الهدف غير موجود" }, { status: 404 });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (targetAmount) updates.targetAmount = parseFloat(targetAmount).toFixed(2);
    if (targetDate !== undefined) updates.targetDate = targetDate || null;

    await db.update(goals).set(updates).where(eq(goals.id, goalId));

    return NextResponse.json({ message: "تم التحديث بنجاح" });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { goalId } = await request.json();

    if (!goalId) {
      return NextResponse.json({ error: "معرف الهدف مطلوب" }, { status: 400 });
    }

    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, session.user.id!)));

    if (!goal) {
      return NextResponse.json({ error: "الهدف غير موجود" }, { status: 404 });
    }

    // 1. حذف المعاملات المرتبطة بالمحفظة
    if (goal.walletId) {
      await db.delete(transactions).where(eq(transactions.walletId, goal.walletId));
    }

    // 2. حذف الهدف
    await db.delete(goals).where(eq(goals.id, goalId));

    // 3. حذف المحفظة
    if (goal.walletId) {
      await db.delete(wallets).where(eq(wallets.id, goal.walletId));
    }

    return NextResponse.json({ message: "تم حذف الهدف بنجاح" });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}