// src/db/schema/index.ts
import {
  pgTable,
  uuid,
  text,
  numeric,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// =====================
// Enums
// =====================
export const walletTypeEnum = pgEnum("wallet_type", [
  "system",
  "goal",
  "custom",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "allocation",
  "expense",
  "goal_contribution",
  "trading_gain",
  "trading_loss",
]);

// =====================
// 1. جدول المستخدمين
// =====================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  image: text("image"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// 2. جدول المحافظ
// =====================
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: walletTypeEnum("type").notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  allocationPercentage: numeric("allocation_percentage", {
    precision: 5,
    scale: 2,
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// 3. جدول قواعد التوزيع
// =====================
export const allocationRules = pgTable("allocation_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  investmentPct: numeric("investment_pct", { precision: 5, scale: 2 })
    .notNull()
    .default("30.00"),
  emergencyPct: numeric("emergency_pct", { precision: 5, scale: 2 })
    .notNull()
    .default("15.00"),
  familyPct: numeric("family_pct", { precision: 5, scale: 2 })
    .notNull()
    .default("10.00"),
  charityPct: numeric("charity_pct", { precision: 5, scale: 2 })
    .notNull()
    .default("5.00"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =====================
// 4. جدول المعاملات
// =====================
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  emotionalState: text("emotional_state"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// 5. جدول الأهداف
// =====================
export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  walletId: uuid("wallet_id")
    .unique()
    .references(() => wallets.id),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  targetDate: date("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. جدول تتبع النقرات
export const referralClicks = pgTable("referral_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  clickedAt: timestamp("clicked_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});