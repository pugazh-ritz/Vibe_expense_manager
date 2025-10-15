import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, ShoppingCart, Coffee, Car, Utensils } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const categories = [
  { id: "food", label: "Food", icon: Utensils },
  { id: "transport", label: "Transport", icon: Car },
  { id: "shopping", label: "Shopping", icon: ShoppingCart },
  { id: "other", label: "Other", icon: Coffee },
];

interface AddExpenseDialogProps {
  onAdd: (expense: InsertExpense) => void;
  isPending?: boolean;
}

export function AddExpenseDialog({ onAdd, isPending }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      amount: "",
      category: "",
      description: "",
    },
  });

  const handleSubmit = (data: InsertExpense) => {
    onAdd(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-10"
          data-testid="button-add-expense"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="dialog-add-expense">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="min-h-12 text-lg"
                      data-testid="input-amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Button
                          key={cat.id}
                          type="button"
                          variant={field.value === cat.id ? "default" : "outline"}
                          className="flex flex-col h-auto py-3 gap-1"
                          onClick={() => field.onChange(cat.id)}
                          data-testid={`button-category-${cat.id}`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{cat.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you buy?"
                      className="resize-none"
                      rows={2}
                      data-testid="input-description"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending}
              data-testid="button-submit-expense"
            >
              {isPending ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
