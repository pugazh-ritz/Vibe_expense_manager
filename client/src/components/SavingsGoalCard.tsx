import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Smartphone, Shirt, Home, Car, Diamond, GraduationCap, Plane, Trophy } from "lucide-react";
import type { SavingsGoal } from "@shared/schema";

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

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onAddSavings?: (goalId: string) => void;
}

export function SavingsGoalCard({ goal, onAddSavings }: SavingsGoalCardProps) {
  const current = parseFloat(goal.currentAmount);
  const target = parseFloat(goal.targetAmount);
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const isCompleted = current >= target;
  const Icon = iconMap[goal.icon as keyof typeof iconMap] || Wallet;

  return (
    <Card className={`p-4 border-l-4 ${isCompleted ? 'border-l-success' : 'border-l-primary'}`} data-testid={`card-goal-${goal.id}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-2 rounded-lg flex-shrink-0 ${isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate" data-testid={`text-goal-name-${goal.id}`}>{goal.name}</h3>
              <p className="text-sm text-muted-foreground">
                ₹{current.toFixed(2)} / ₹{target.toFixed(2)}
              </p>
            </div>
          </div>
          {onAddSavings && !isCompleted && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onAddSavings(goal.id)}
              className="flex-shrink-0"
              data-testid={`button-add-savings-${goal.id}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-1">
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-2"
            indicatorClassName={isCompleted ? 'bg-success' : 'bg-primary'}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentage.toFixed(0)}% complete</span>
            {isCompleted && (
              <span className="text-success font-medium flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Goal Achieved!
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
