// src/app/api/admin/login-as/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // تحقق من admin
    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email!));

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    // جلب المستخدم المطلوب
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // إنشاء JWT مخصص يدويًا باستخدام next-auth
    // نرجع رابط تسجيل دخول خاص
    const callbackUrl = `/api/auth/callback/credentials?email=${encodeURIComponent(session.user.email!)}&adminId=${userId}`;

    return NextResponse.json({ callbackUrl });
  } catch (error) {
    console.error("Login as error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}