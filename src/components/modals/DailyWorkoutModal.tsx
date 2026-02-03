import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Dumbbell, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkouts, WorkoutWithExercises } from "@/hooks/useWorkouts";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { format, isToday, isTomorrow, isYesterday, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartWorkout?: (workout: WorkoutWithExercises) => void;
}

const DailyWorkoutModal = ({ open, onOpenChange, onStartWorkout }: DailyWorkoutModalProps) => {
  const { workouts, isLoading } = useWorkouts();
  const { sessions } = useWorkoutSessions();

  // Get the day label
  const getDayLabel = (date: Date): string => {
    if (isYesterday(date)) return "Ontem";
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEEE", { locale: ptBR });
  };

  // Create workout schedule based on user's workouts and frequency
  const getScheduledWorkouts = () => {
    if (!workouts || workouts.length === 0) return [];

    const today = new Date();
    const schedule: Array<{
      workout: WorkoutWithExercises;
      date: Date;
      dayLabel: string;
      dateFormatted: string;
      status: "completed" | "today" | "upcoming";
    }> = [];

    // Check completed sessions from yesterday
    const yesterday = addDays(today, -1);
    const yesterdaySession = sessions?.find(s => {
      const sessionDate = new Date(s.started_at || s.created_at || "");
      return format(sessionDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd") && s.status === "completed";
    });

    if (yesterdaySession && workouts.length > 0) {
      const workout = workouts.find(w => w.id === yesterdaySession.workout_id) || workouts[0];
      schedule.push({
        workout,
        date: yesterday,
        dayLabel: getDayLabel(yesterday),
        dateFormatted: format(yesterday, "dd/MM"),
        status: "completed",
      });
    }

    // Today's workout
    const todaySession = sessions?.find(s => {
      const sessionDate = new Date(s.started_at || s.created_at || "");
      return format(sessionDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
    });

    if (workouts.length > 0) {
      const workoutIndex = schedule.length % workouts.length;
      schedule.push({
        workout: workouts[workoutIndex],
        date: today,
        dayLabel: getDayLabel(today),
        dateFormatted: format(today, "dd/MM"),
        status: todaySession?.status === "completed" ? "completed" : "today",
      });
    }

    // Upcoming workouts (next 3 days)
    for (let i = 1; i <= 3 && workouts.length > 0; i++) {
      const futureDate = addDays(today, i);
      const workoutIndex = (schedule.length) % workouts.length;
      schedule.push({
        workout: workouts[workoutIndex],
        date: futureDate,
        dayLabel: getDayLabel(futureDate),
        dateFormatted: format(futureDate, "dd/MM"),
        status: "upcoming",
      });
    }

    return schedule;
  };

  const scheduledWorkouts = getScheduledWorkouts();

  const handleStartWorkout = (workout: WorkoutWithExercises) => {
    onOpenChange(false);
    onStartWorkout?.(workout);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Calendar className="text-primary" size={24} />
            Treino do Dia
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </>
          ) : scheduledWorkouts.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <ListChecks className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Nenhum treino criado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie seu primeiro treino para ver sua agenda aqui
                </p>
              </div>
            </div>
          ) : (
            scheduledWorkouts.map((item, index) => (
              <div
                key={`${item.workout.id}-${index}`}
                className={`rounded-xl p-4 transition-all ${
                  item.status === "today"
                    ? "bg-primary/10 border-2 border-primary"
                    : item.status === "completed"
                    ? "bg-success/10 border border-success/30"
                    : "bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      item.status === "today"
                        ? "wemovelt-gradient text-primary-foreground"
                        : item.status === "completed"
                        ? "bg-success text-success-foreground"
                        : "bg-muted-foreground/30 text-muted-foreground"
                    }`}>
                      {item.dayLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.dateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {item.workout.workout_exercises?.length || 0} exercícios
                  </div>
                </div>

                <h4 className="font-bold">{item.workout.name}</h4>
                {item.workout.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.workout.description}</p>
                )}

                <div className="flex flex-wrap gap-1 mt-2">
                  {item.workout.workout_exercises?.slice(0, 4).map((exercise) => (
                    <span
                      key={exercise.id}
                      className="text-xs bg-background/50 px-2 py-1 rounded-full text-muted-foreground"
                    >
                      {exercise.name}
                    </span>
                  ))}
                  {(item.workout.workout_exercises?.length || 0) > 4 && (
                    <span className="text-xs bg-background/50 px-2 py-1 rounded-full text-muted-foreground">
                      +{(item.workout.workout_exercises?.length || 0) - 4}
                    </span>
                  )}
                </div>

                {item.status === "today" && (
                  <Button 
                    onClick={() => handleStartWorkout(item.workout)}
                    className="w-full mt-4 wemovelt-gradient font-bold rounded-xl"
                  >
                    <Dumbbell size={18} className="mr-2" />
                    Iniciar Treino
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyWorkoutModal;
