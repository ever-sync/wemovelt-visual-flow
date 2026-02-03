import { Droplets, Moon, Apple, Smile, Check, Flame } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { cn } from "@/lib/utils";

const habits = [
  { 
    type: "hydration", 
    icon: Droplets, 
    label: "Hidratação", 
    color: "bg-blue-500/20",
    activeColor: "bg-blue-500",
    iconColor: "text-blue-400",
  },
  { 
    type: "sleep", 
    icon: Moon, 
    label: "Sono", 
    color: "bg-purple-500/20",
    activeColor: "bg-purple-500",
    iconColor: "text-purple-400",
  },
  { 
    type: "nutrition", 
    icon: Apple, 
    label: "Alimentação", 
    color: "bg-green-500/20",
    activeColor: "bg-green-500",
    iconColor: "text-green-400",
  },
  { 
    type: "wellness", 
    icon: Smile, 
    label: "Bem-estar", 
    color: "bg-yellow-500/20",
    activeColor: "bg-yellow-500",
    iconColor: "text-yellow-400",
  },
];

interface HabitTrackerProps {
  compact?: boolean;
}

const HabitTracker = ({ compact = false }: HabitTrackerProps) => {
  const { isHabitCompleted, toggleHabit, getStreakForHabit, isToggling, isLoading } = useHabits();

  const handleToggle = async (type: string) => {
    try {
      await toggleHabit({ habitType: type });
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-secondary rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        {habits.map(({ type, icon: Icon, color, activeColor, iconColor }) => {
          const completed = isHabitCompleted(type);
          
          return (
            <button
              key={type}
              onClick={() => handleToggle(type)}
              disabled={isToggling}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                completed ? activeColor : color,
                isToggling && "opacity-50"
              )}
            >
              {completed ? (
                <Check className="text-white" size={20} />
              ) : (
                <Icon className={iconColor} size={20} />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 space-y-3">
      <h3 className="font-bold text-sm text-muted-foreground">HÁBITOS DE HOJE</h3>
      
      {habits.map(({ type, icon: Icon, label, color, activeColor, iconColor }) => {
        const completed = isHabitCompleted(type);
        const streak = getStreakForHabit(type);
        
        return (
          <button
            key={type}
            onClick={() => handleToggle(type)}
            disabled={isToggling}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
              completed ? activeColor : color,
              isToggling && "opacity-50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              completed ? "bg-white/20" : "bg-background/50"
            )}>
              {completed ? (
                <Check className="text-white" size={20} />
              ) : (
                <Icon className={iconColor} size={20} />
              )}
            </div>
            
            <div className="flex-1 text-left">
              <span className={cn(
                "font-medium",
                completed && "text-white"
              )}>
                {label}
              </span>
            </div>
            
            {streak > 0 && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                completed ? "bg-white/20 text-white" : "bg-orange-500/20 text-orange-400"
              )}>
                <Flame size={12} />
                {streak}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default HabitTracker;
