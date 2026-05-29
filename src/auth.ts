// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
        adminId: { label: "Admin User ID", type: "text" },
      },
      async authorize(credentials) {
        // إذا كان admin يسجل دخول كمستخدم آخر
        if (credentials?.adminId && credentials?.email) {
          // تحقق من admin
          const [admin] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string));

          if (!admin || admin.role !== "admin") {
            return null;
          }

          // جلب المستخدم المطلوب
          const [targetUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, credentials.adminId as string));

          if (!targetUser) return null;

          return {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            image: targetUser.image,
            role: targetUser.role,
          };
        }

        // تسجيل دخول عادي
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
    callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // جلب role من قاعدة البيانات
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!));
        token.role = dbUser?.role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});