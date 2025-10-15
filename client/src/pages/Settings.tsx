import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { DailyBudget } from "@shared/schema";
import { Settings as SettingsIcon, IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [dailyLimit, setDailyLimit] = useState("");

  const { data: budget, isLoading } = useQuery<DailyBudget>({
    queryKey: ["/api/budget", today],
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (limit: string) => {
      return await apiRequest("POST", "/api/budget", { limit, date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
      setDailyLimit("");
      toast({
        title: "Budget updated",
        description: "Your daily budget limit has been set successfully.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyLimit || parseFloat(dailyLimit) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid daily limit.",
        variant: "destructive",
      });
      return;
    }
    updateBudgetMutation.mutate(dailyLimit);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card border-b border-card-border p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Settings</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Budget Settings</h2>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Current Daily Limit</h3>
                <div className="flex items-center gap-2 text-3xl font-bold font-mono text-primary">
                  <IndianRupee className="h-7 w-7" />
                  <span data-testid="text-current-limit">
                    {budget ? parseFloat(budget.limit).toFixed(2) : "250.00"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">Set New Daily Limit (₹)</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    step="0.01"
                    placeholder="250.00"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="min-h-12 text-lg"
                    data-testid="input-daily-limit"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={updateBudgetMutation.isPending}
                  data-testid="button-update-budget"
                >
                  {updateBudgetMutation.isPending ? "Updating..." : "Update Daily Limit"}
                </Button>
              </form>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-medium mb-2">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-medium mb-2">How It Works</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Set your daily spending limit</p>
            <p>2. Track expenses throughout the day</p>
            <p>3. Any unspent amount can be allocated to savings goals</p>
            <p>4. Watch your savings grow towards your goals!</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
