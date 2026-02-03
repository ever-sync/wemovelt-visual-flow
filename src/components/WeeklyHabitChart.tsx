import { useHabits, HabitStats } from "@/hooks/useHabits";
import { Droplets, Moon, Apple, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const habitConfig = {
  hydration: { icon: Droplets, color: "bg-blue-500", label: "Hidratação" },
  sleep: { icon: Moon, color: "bg-purple-500", label: "Sono" },
  nutrition: { icon: Apple, color: "bg-green-500", label: "Alimentação" },
  wellness: { icon: Smile, color: "bg-yellow-500", label: "Bem-estar" },
};

const WeeklyHabitChart = () => {
  const { weeklyStats, isLoading } = useHabits();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-secondary rounded w-1/3" />
          <div className="h-24 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 space-y-4">
      <h3 className="font-bold">Progresso Semanal</h3>
      
      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
          <span key={day} className="text-xs text-muted-foreground">{day}</span>
        ))}
      </div>
      
      {/* Habit rows */}
      {weeklyStats.map((stat) => {
        const config = habitConfig[stat.type as keyof typeof habitConfig];
        if (!config) return null;
        
        const Icon = config.icon;
        
        return (
          <div key={stat.type} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{config.label}</span>
              <span className="text-xs font-medium ml-auto">
                {stat.completedDays}/7
              </span>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {stat.weeklyData.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-6 rounded-md transition-colors",
                    day.completed ? config.color : "bg-secondary"
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-secondary" />
          <span className="text-xs text-muted-foreground">Pendente</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHabitChart;
