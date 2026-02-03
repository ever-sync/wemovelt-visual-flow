import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { Trophy, Clock, Flame, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const WorkoutStats = () => {
  const { isLoading, getStats } = useWorkoutSessions();
  const stats = getStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Trophy,
      value: stats.totalSessions,
      label: "Treinos",
      color: "text-yellow-500",
    },
    {
      icon: Clock,
      value: `${Math.floor(stats.totalMinutes / 60)}h`,
      label: "Total",
      color: "text-blue-500",
    },
    {
      icon: Flame,
      value: `${stats.averageDuration}min`,
      label: "Média",
      color: "text-orange-500",
    },
    {
      icon: Calendar,
      value: `${stats.sessionsThisWeek}x`,
      label: "Esta semana",
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statCards.map(({ icon: Icon, value, label, color }) => (
        <div
          key={label}
          className="bg-card rounded-xl p-4 flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${color}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutStats;
