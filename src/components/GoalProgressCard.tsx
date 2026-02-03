import { Check, Trash2 } from "lucide-react";
import { GoalWithProgress } from "@/hooks/useGoals";
import { cn } from "@/lib/utils";

interface GoalProgressCardProps {
  goal: GoalWithProgress;
  onDelete?: (id: string) => void;
}

const GoalProgressCard = ({ goal, onDelete }: GoalProgressCardProps) => {
  const isCompleted = goal.percentage >= 100;
  const remaining = Math.max(0, goal.target - goal.current);
  
  return (
    <div className="bg-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "font-medium",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {goal.title}
        </span>
        
        <div className="flex items-center gap-2">
          {isCompleted && <Check className="text-success" size={20} />}
          {onDelete && (
            <button 
              onClick={() => onDelete(goal.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              isCompleted ? "bg-success" : "wemovelt-gradient"
            )}
            style={{ width: `${goal.percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {goal.current}/{goal.target}
        </span>
      </div>
      
      {!isCompleted && remaining > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Faltam {remaining} {goal.unit === "times_per_week" ? (remaining === 1 ? "vez" : "vezes") : ""}
        </p>
      )}
    </div>
  );
};

export default GoalProgressCard;
