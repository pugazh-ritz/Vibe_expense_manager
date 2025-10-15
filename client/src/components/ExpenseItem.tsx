import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Coffee, Car, Utensils } from "lucide-react";
import type { Expense } from "@shared/schema";
import { format } from "date-fns";

const categoryIcons = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingCart,
  other: Coffee,
};

const categoryColors = {
  food: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  transport: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shopping: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  other: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function ExpenseItem({ expense, onDelete, isDeleting }: ExpenseItemProps) {
  const Icon = categoryIcons[expense.category as keyof typeof categoryIcons] || Coffee;
  const colorClass = categoryColors[expense.category as keyof typeof categoryColors] || categoryColors.other;

  return (
    <Card className="p-4" data-testid={`card-expense-${expense.id}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" data-testid={`text-expense-description-${expense.id}`}>
            {expense.description || expense.category}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(expense.date), "h:mm a")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-mono font-semibold text-lg" data-testid={`text-expense-amount-${expense.id}`}>
            ₹{parseFloat(expense.amount).toFixed(2)}
          </p>
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(expense.id)}
              disabled={isDeleting}
              data-testid={`button-delete-${expense.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
