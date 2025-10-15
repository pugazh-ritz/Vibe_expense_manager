import { 
  type Expense, 
  type InsertExpense,
  type SavingsGoal,
  type InsertSavingsGoal,
  type DailyBudget,
  type InsertDailyBudget
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private expenses: Map<string, Expense>;
  private savingsGoals: Map<string, SavingsGoal>;
  private dailyBudgets: Map<string, DailyBudget>;

  constructor() {
    this.expenses = new Map();
    this.savingsGoals = new Map();
    this.dailyBudgets = new Map();
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = { 
      ...insertExpense,
      description: insertExpense.description || null,
      id, 
      date: new Date().toISOString() 
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getExpensesByDate(date: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(e => e.date.startsWith(date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async deleteExpense(id: string): Promise<void> {
    this.expenses.delete(id);
  }

  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = randomUUID();
    const goal: SavingsGoal = { 
      ...insertGoal,
      icon: insertGoal.icon || null,
      id,
      currentAmount: "0",
      createdAt: new Date().toISOString() 
    };
    this.savingsGoals.set(id, goal);
    return goal;
  }

  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSavingsGoal(id: string): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }

  async addToSavingsGoal(id: string, amount: number): Promise<SavingsGoal> {
    const goal = this.savingsGoals.get(id);
    if (!goal) throw new Error("Goal not found");
    
    const currentAmount = parseFloat(goal.currentAmount) + amount;
    const updatedGoal = { ...goal, currentAmount: currentAmount.toString() };
    this.savingsGoals.set(id, updatedGoal);
    return updatedGoal;
  }

  async createOrUpdateDailyBudget(insertBudget: InsertDailyBudget): Promise<DailyBudget> {
    const existing = this.dailyBudgets.get(insertBudget.date);
    if (existing) {
      const updated = { ...existing, limit: insertBudget.limit };
      this.dailyBudgets.set(insertBudget.date, updated);
      return updated;
    }
    
    const id = randomUUID();
    const budget: DailyBudget = { 
      ...insertBudget, 
      id,
      spent: "0" 
    };
    this.dailyBudgets.set(insertBudget.date, budget);
    return budget;
  }

  async getDailyBudget(date: string): Promise<DailyBudget | undefined> {
    return this.dailyBudgets.get(date);
  }

  async updateBudgetSpent(date: string, amount: number): Promise<void> {
    const budget = this.dailyBudgets.get(date);
    if (budget) {
      const spent = parseFloat(budget.spent) + amount;
      this.dailyBudgets.set(date, { ...budget, spent: spent.toString() });
    }
  }
}

export const storage = new MemStorage();
