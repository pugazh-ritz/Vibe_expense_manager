import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ExpenseItem } from "@/components/ExpenseItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { History as HistoryIcon, BarChart3 } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";

export default function History() {
  const { toast } = useToast();

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/expenses/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
      toast({
        title: "Expense deleted",
        description: "The expense has been removed.",
      });
    },
  });

  const groupedExpenses = expenses.reduce((groups, expense) => {
    const dateStr = expense.date.split('T')[0];
    const date = parseISO(dateStr);
    let label: string;
    
    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else {
      label = format(dateStr, "MMMM d, yyyy");
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  const sortedGroups = Object.entries(groupedExpenses).sort((a, b) => {
    const dateA = parseISO(a[1][0].date.split('T')[0]);
    const dateB = parseISO(b[1][0].date.split('T')[0]);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card border-b border-card-border p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Expense History</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">All Transactions</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 inline-flex p-4 rounded-full bg-muted">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No expense history</h3>
            <p className="text-sm text-muted-foreground">
              Your expense history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedGroups.map(([label, groupExpenses]) => (
              <div key={label}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{label}</h3>
                <div className="space-y-3">
                  {groupExpenses.map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onDelete={deleteExpenseMutation.mutate}
                      isDeleting={deleteExpenseMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
