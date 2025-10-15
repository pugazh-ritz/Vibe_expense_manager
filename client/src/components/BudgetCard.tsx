import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetCardProps {
  remaining: number;
  limit: number;
  spent: number;
}

export function BudgetCard({ remaining, limit, spent }: BudgetCardProps) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const isOverspent = remaining < 0;
  const isWarning = !isOverspent && remaining <= limit * 0.2;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-0">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium opacity-90">Today's Balance</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-2xl font-bold">₹</span>
            <span className={`text-5xl md:text-6xl font-bold font-mono ${isOverspent ? 'text-destructive-foreground' : ''}`}>
              {Math.abs(remaining).toFixed(2)}
            </span>
          </div>
          {isOverspent && (
            <p className="mt-2 text-sm font-medium text-destructive-foreground">
              Overspent by ₹{Math.abs(remaining).toFixed(2)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Progress 
            value={Math.min(percentage, 100)} 
            className={`h-3 ${isOverspent ? 'bg-destructive/30' : 'bg-white/20'}`}
            indicatorClassName={isOverspent ? 'bg-destructive' : isWarning ? 'bg-warning' : 'bg-white'}
          />
          <div className="flex justify-between text-xs opacity-90">
            <span>Spent: ₹{spent.toFixed(2)}</span>
            <span>Limit: ₹{limit.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
