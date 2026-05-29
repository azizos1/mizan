// src/app/api/admin/impersonate/route.ts
import { NextResponse } from "next/server";
import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    await signIn("credentials", {
      email: admin.email,
      password: "admin-override",
      adminId: userId,
      redirect: false,
    });

    return NextResponse.json({ success: true, redirect: "/dashboard" });
  } catch (error) {
    console.error("Impersonate error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}