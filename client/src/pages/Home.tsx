import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BudgetCard } from "@/components/BudgetCard";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AllocateSavingsDialog } from "@/components/AllocateSavingsDialog";
import { ExpenseItem } from "@/components/ExpenseItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { InsertExpense, Expense, DailyBudget } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingDown, PiggyBank } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [allocateOpen, setAllocateOpen] = useState(false);

  const { data: budget, isLoading: budgetLoading } = useQuery<DailyBudget>({
    queryKey: ["/api/budget", today],
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses/today"],
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      return await apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget", today] });
      toast({
        title: "Expense added",
        description: "Your expense has been tracked successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/expenses/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget", today] });
      toast({
        title: "Expense deleted",
        description: "The expense has been removed.",
      });
    },
  });

  const allocateSavingsMutation = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      return await apiRequest("POST", "/api/budget/allocate", { goalId, amount, date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setAllocateOpen(false);
      toast({
        title: "Savings allocated",
        description: "Your remaining budget has been added to your savings goal.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to allocate savings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const remaining = budget ? parseFloat(budget.limit) - parseFloat(budget.spent) : 0;
  const limit = budget ? parseFloat(budget.limit) : 250;
  const spent = budget ? parseFloat(budget.spent) : 0;

  if (budgetLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-10 bg-card border-b border-card-border p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Today's Budget</h1>
          <ThemeToggle />
        </header>
        <div className="p-4 space-y-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Budget Set</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please set your daily budget in Settings to start tracking expenses.
          </p>
          <Button asChild>
            <a href="/settings">Go to Settings</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card border-b border-card-border p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Today's Budget</h1>
        <ThemeToggle />
      </header>

      <div className="p-4 space-y-6">
        <BudgetCard remaining={remaining} limit={limit} spent={spent} />

        {remaining > 0 && (
          <Button
            onClick={() => setAllocateOpen(true)}
            className="w-full"
            variant="outline"
            data-testid="button-allocate-savings"
          >
            <PiggyBank className="h-4 w-4 mr-2" />
            Allocate ₹{remaining.toFixed(2)} to Savings
          </Button>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Today's Expenses
            </h2>
            <p className="text-sm text-muted-foreground">
              {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {expensesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 inline-flex p-4 rounded-full bg-muted">
                <TrendingDown className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No expenses yet</h3>
              <p className="text-sm text-muted-foreground">
                Track your spending by adding your first expense
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onDelete={deleteExpenseMutation.mutate}
                  isDeleting={deleteExpenseMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddExpenseDialog
        onAdd={addExpenseMutation.mutate}
        isPending={addExpenseMutation.isPending}
      />

      <AllocateSavingsDialog
        open={allocateOpen}
        onOpenChange={setAllocateOpen}
        remainingAmount={remaining}
        onAllocate={(goalId) => allocateSavingsMutation.mutate({ goalId, amount: remaining })}
        isPending={allocateSavingsMutation.isPending}
      />
    </div>
  );
}
