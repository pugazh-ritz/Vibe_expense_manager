import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  date: text("date").notNull(),
});

export const savingsGoals = pgTable("savings_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  icon: varchar("icon", { length: 100 }).default("wallet"),
  createdAt: text("created_at").notNull(),
});

export const dailyBudget = pgTable("daily_budget", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD format
  limit: decimal("limit", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0"),
});

// Insert schemas
export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  date: true,
}).extend({
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).omit({
  id: true,
  currentAmount: true,
  createdAt: true,
}).extend({
  targetAmount: z.string().min(1, "Target amount is required"),
});

export const insertDailyBudgetSchema = createInsertSchema(dailyBudget).omit({
  id: true,
  spent: true,
}).extend({
  limit: z.string().min(1, "Daily limit is required"),
});

// Types
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export type SavingsGoal = typeof savingsGoals.$inferSelect;

export type InsertDailyBudget = z.infer<typeof insertDailyBudgetSchema>;
export type DailyBudget = typeof dailyBudget.$inferSelect;
