import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertSavingsGoalSchema, insertDailyBudgetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Expense routes
  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(data);
      
      // Update daily budget spent amount
      const today = new Date().toISOString().split("T")[0];
      await storage.updateBudgetSpent(today, parseFloat(data.amount));
      
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create expense" });
      }
    }
  });

  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const expenses = await storage.getExpensesByDate(today);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's expenses" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get expense to calculate budget adjustment
      const expenses = await storage.getExpenses();
      const expense = expenses.find(e => e.id === id);
      
      if (expense) {
        await storage.deleteExpense(id);
        
        // Update daily budget spent amount
        const expenseDate = expense.date.split("T")[0];
        await storage.updateBudgetSpent(expenseDate, -parseFloat(expense.amount));
        
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Expense not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Savings goals routes
  app.post("/api/goals", async (req, res) => {
    try {
      const data = insertSavingsGoalSchema.parse(req.body);
      const goal = await storage.createSavingsGoal(data);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create goal" });
      }
    }
  });

  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getSavingsGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals/:id/add", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      
      const updatedGoal = await storage.addToSavingsGoal(id, parseFloat(amount));
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ error: "Failed to add savings" });
    }
  });

  // Daily budget routes
  app.post("/api/budget", async (req, res) => {
    try {
      const data = insertDailyBudgetSchema.parse(req.body);
      const budget = await storage.createOrUpdateDailyBudget(data);
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create/update budget" });
      }
    }
  });

  app.get("/api/budget/:date", async (req, res) => {
    try {
      const { date } = req.params;
      let budget = await storage.getDailyBudget(date);
      
      // If no budget exists for this date, create a default one
      if (!budget) {
        budget = await storage.createOrUpdateDailyBudget({
          date,
          limit: "250" // Default daily limit
        });
      }
      
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget" });
    }
  });

  // Allocate remaining budget to savings goal
  app.post("/api/budget/allocate", async (req, res) => {
    try {
      const { goalId, amount, date } = req.body;
      
      if (!goalId || !amount || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const numAmount = parseFloat(amount);
      if (numAmount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Add amount to savings goal
      const updatedGoal = await storage.addToSavingsGoal(goalId, numAmount);
      
      // Update budget spent to reflect allocation (remaining becomes 0)
      await storage.updateBudgetSpent(date, numAmount);
      
      res.json({ success: true, goal: updatedGoal });
    } catch (error) {
      res.status(500).json({ error: "Failed to allocate savings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
