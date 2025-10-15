import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SavingsGoalCard } from "@/components/SavingsGoalCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSavingsGoalSchema, type InsertSavingsGoal, type SavingsGoal } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target, Wallet, Smartphone, Shirt, Home, Car, Diamond, GraduationCap, Plane } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const iconOptions = [
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "smartphone", icon: Smartphone, label: "Phone" },
  { id: "shirt", icon: Shirt, label: "Clothes" },
  { id: "home", icon: Home, label: "Home" },
  { id: "car", icon: Car, label: "Vehicle" },
  { id: "diamond", icon: Diamond, label: "Jewelry" },
  { id: "graduation", icon: GraduationCap, label: "Education" },
  { id: "plane", icon: Plane, label: "Travel" },
];

export default function Goals() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [addSavingsOpen, setAddSavingsOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");

  const { data: goals = [], isLoading } = useQuery<SavingsGoal[]>({
    queryKey: ["/api/goals"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: InsertSavingsGoal) => {
      return await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setCreateOpen(false);
      toast({
        title: "Goal created",
        description: "Your savings goal has been created successfully.",
      });
    },
  });

  const addSavingsMutation = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: string }) => {
      return await apiRequest("POST", `/api/goals/${goalId}/add`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setAddSavingsOpen(false);
      setSavingsAmount("");
      toast({
        title: "Savings added",
        description: "Your savings have been added to the goal.",
      });
    },
  });

  const form = useForm<InsertSavingsGoal>({
    resolver: zodResolver(insertSavingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      icon: "wallet",
    },
  });

  const handleAddSavings = (goalId: string) => {
    setSelectedGoalId(goalId);
    setAddSavingsOpen(true);
  };

  const handleSavingsSubmit = () => {
    if (!savingsAmount || parseFloat(savingsAmount) <= 0) return;
    addSavingsMutation.mutate({ goalId: selectedGoalId, amount: savingsAmount });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card border-b border-card-border p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Savings Goals</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Your Goals</h2>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-goal">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Savings Goal</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createGoalMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {iconOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <Button
                                key={option.id}
                                type="button"
                                variant={field.value === option.id ? "default" : "outline"}
                                className="h-12 flex flex-col gap-1"
                                onClick={() => field.onChange(option.id)}
                                data-testid={`button-icon-${option.id}`}
                              >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs">{option.label}</span>
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., New Phone" data-testid="input-goal-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="10000" data-testid="input-target-amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createGoalMutation.isPending} data-testid="button-submit-goal">
                    {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 inline-flex p-4 rounded-full bg-muted">
              <Target className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No savings goals yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first goal to start saving
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onAddSavings={handleAddSavings}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={addSavingsOpen} onOpenChange={setAddSavingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Savings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (₹)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={savingsAmount}
                onChange={(e) => setSavingsAmount(e.target.value)}
                className="min-h-12 text-lg"
                data-testid="input-savings-amount"
              />
            </div>
            <Button
              onClick={handleSavingsSubmit}
              className="w-full"
              disabled={addSavingsMutation.isPending}
              data-testid="button-submit-savings"
            >
              {addSavingsMutation.isPending ? "Adding..." : "Add Savings"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
