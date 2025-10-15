import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { SavingsGoal } from "@shared/schema";
import { Wallet, Smartphone, Shirt, Home, Car, Diamond, GraduationCap, Plane, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

const iconMap = {
  wallet: Wallet,
  smartphone: Smartphone,
  shirt: Shirt,
  home: Home,
  car: Car,
  diamond: Diamond,
  graduation: GraduationCap,
  plane: Plane,
};

interface AllocateSavingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingAmount: number;
  onAllocate: (goalId: string) => void;
  isPending?: boolean;
}

export function AllocateSavingsDialog({ 
  open, 
  onOpenChange, 
  remainingAmount,
  onAllocate,
  isPending 
}: AllocateSavingsDialogProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  const { data: goals = [] } = useQuery<SavingsGoal[]>({
    queryKey: ["/api/goals"],
    enabled: open,
  });

  const handleAllocate = () => {
    if (selectedGoalId) {
      onAllocate(selectedGoalId);
      setSelectedGoalId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-allocate-savings">
        <DialogHeader>
          <DialogTitle>Allocate Savings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Amount to Allocate</p>
            <p className="text-2xl font-bold font-mono text-success">
              ₹{remainingAmount.toFixed(2)}
            </p>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">
                No savings goals yet. Create a goal first to allocate your savings.
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)} asChild>
                <a href="/goals">Create Goal</a>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">Select a Goal</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {goals.map((goal) => {
                    const Icon = iconMap[goal.icon as keyof typeof iconMap] || Wallet;
                    const current = parseFloat(goal.currentAmount);
                    const target = parseFloat(goal.targetAmount);
                    const isCompleted = current >= target;
                    const isSelected = selectedGoalId === goal.id;

                    return (
                      <Card
                        key={goal.id}
                        className={`p-3 cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover-elevate'
                        } ${isCompleted ? 'opacity-50' : ''}`}
                        onClick={() => !isCompleted && setSelectedGoalId(goal.id)}
                        data-testid={`card-select-goal-${goal.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{goal.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ₹{current.toFixed(2)} / ₹{target.toFixed(2)}
                            </p>
                          </div>
                          {isSelected && <Check className="h-5 w-5 text-primary" />}
                          {isCompleted && (
                            <span className="text-xs text-success font-medium">Completed</span>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleAllocate}
                disabled={!selectedGoalId || isPending}
                className="w-full"
                data-testid="button-confirm-allocate"
              >
                {isPending ? "Allocating..." : "Allocate to Goal"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
