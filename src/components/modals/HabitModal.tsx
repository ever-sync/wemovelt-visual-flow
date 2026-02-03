import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LucideIcon, Flame, Check, Loader2 } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
  iconColor: string;
  description: string;
  tips: string[];
}

interface HabitModalProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HabitModal = ({ habit, open, onOpenChange }: HabitModalProps) => {
  const { isHabitCompleted, toggleHabit, getStreakForHabit, weeklyStats, isToggling } = useHabits();
  
  if (!habit) return null;

  const Icon = habit.icon;
  const isCompleted = isHabitCompleted(habit.id);
  const streak = getStreakForHabit(habit.id);
  const habitStats = weeklyStats.find(s => s.type === habit.id);

  const handleToggle = async () => {
    try {
      await toggleHabit({ habitType: habit.id });
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
            isCompleted ? "wemovelt-gradient" : habit.color
          )}>
            {isCompleted ? (
              <Check className="text-white" size={32} />
            ) : (
              <Icon className={habit.iconColor} size={32} />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {habit.label}
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            {habit.description}
          </p>
        </DialogHeader>

        {/* Streak and Weekly Progress */}
        <div className="flex items-center justify-center gap-6 py-4 border-y border-border">
          {streak > 0 && (
            <div className="flex items-center gap-2">
              <Flame className="text-orange-400" size={20} />
              <div>
                <p className="font-bold">{streak}</p>
                <p className="text-xs text-muted-foreground">dias seguidos</p>
              </div>
            </div>
          )}
          
          {habitStats && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {habitStats.weeklyData.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-sm",
                      day.completed ? "bg-primary" : "bg-secondary"
                    )}
                    title={day.day}
                  />
                ))}
              </div>
              <div>
                <p className="font-bold">{habitStats.completedDays}/7</p>
                <p className="text-xs text-muted-foreground">esta semana</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <h4 className="font-bold text-sm">Dicas práticas:</h4>
          {habit.tips.map((tip, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-secondary rounded-xl animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={18} />
              <span className="text-sm">{tip}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <Button 
            onClick={handleToggle}
            disabled={isToggling}
            variant={isCompleted ? "secondary" : "default"}
            className={cn(
              "flex-1 h-12 rounded-xl font-bold",
              !isCompleted && "wemovelt-gradient"
            )}
          >
            {isToggling ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isCompleted ? (
              <>
                <Check size={18} className="mr-2" />
                Concluído hoje
              </>
            ) : (
              "Marcar como feito"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HabitModal;
