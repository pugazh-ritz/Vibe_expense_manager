import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import {
  expenses,
  savingsGoals,
  dailyBudget,
  type Expense,
  type InsertExpense,
  type SavingsGoal,
  type InsertSavingsGoal,
  type DailyBudget,
  type InsertDailyBudget,
} from "@shared/schema";

// Connect to Postgres using the DATABASE_URL from Render
// SSL required for Render’s hosted PostgreSQL
const client = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
export const db = drizzle(client);

export interface IStorage {
  // Expense methods
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;
  getExpensesByDate(date: string): Promise<Expense[]>;
  deleteExpense(id: string): Promise<void>;

  // Savings Goal methods
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  getSavingsGoals(): Promise<SavingsGoal[]>;
  getSavingsGoal(id: string): Promise<SavingsGoal | undefined>;
  addToSavingsGoal(id: string, amount: number): Promise<SavingsGoal>;

  // Daily Budget methods
  createOrUpdateDailyBudget(budget: InsertDailyBudget): Promise<DailyBudget>;
  getDailyBudget(date: string): Promise<DailyBudget | undefined>;
  updateBudgetSpent(date: string, amount: number): Promise<void>;
}

export class PostgresStorage implements IStorage {
  // ----- Expenses -----
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values({
      ...expense,
      date: new Date().toISOString().split("T")[0],
    }).returning();
    return newExpense;
  }

  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses);
  }

  async getExpensesByDate(date: string): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.date, date));
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // ----- Savings Goals -----
  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [newGoal] = await db.insert(savingsGoals).values({
      ...goal,
      currentAmount: "0",
      createdAt: new Date().toISOString(),
    }).returning();
    return newGoal;
  }

  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return await db.select().from(savingsGoals);
  }

  async getSavingsGoal(id: string): Promise<SavingsGoal | undefined> {
    const [goal] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, id));
    return goal;
  }

  async addToSavingsGoal(id: string, amount: number): Promise<SavingsGoal> {
    const goal = await this.getSavingsGoal(id);
    if (!goal) throw new Error("Savings goal not found");

    const updatedAmount = Number(goal.currentAmount) + amount;
    const [updatedGoal] = await db.update(savingsGoals)
      .set({ currentAmount: updatedAmount.toString() })
      .where(eq(savingsGoals.id, id))
      .returning();

    return updatedGoal;
  }

  // ----- Daily Budget -----
  async createOrUpdateDailyBudget(budget: InsertDailyBudget): Promise<DailyBudget> {
    const existing = await this.getDailyBudget(budget.date);
    if (existing) {
      const [updated] = await db.update(dailyBudget)
        .set({ limit: budget.limit })
        .where(eq(dailyBudget.date, budget.date))
        .returning();
      return updated;
    } else {
      const [newBudget] = await db.insert(dailyBudget).values(budget).returning();
      return newBudget;
    }
  }

  async getDailyBudget(date: string): Promise<DailyBudget | undefined> {
    const [budget] = await db.select().from(dailyBudget).where(eq(dailyBudget.date, date));
    return budget;
  }

  async updateBudgetSpent(date: string, amount: number): Promise<void> {
    const budget = await this.getDailyBudget(date);
    if (!budget) throw new Error("Budget not found");

    const updatedSpent = Number(budget.spent) + amount;
    await db.update(dailyBudget)
      .set({ spent: updatedSpent.toString() })
      .where(eq(dailyBudget.date, date));
  }
}

// ✅ after defining PostgresStorage above
export const storage = new PostgresStorage();
// 🧱 Automatically sync schema (creates tables if missing)
import * as schema from "@shared/schema";

(async () => {
  try {
    console.log("🔄 Syncing database schema...");
    await db.execute(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);
    await db.sync({ schema });
    console.log("✅ Database schema synced successfully!");
  } catch (err) {
    console.error("❌ Failed to sync schema:", err);
  }
})();
