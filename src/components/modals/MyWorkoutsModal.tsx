import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Clock, Dumbbell, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useWorkouts, WorkoutWithExercises } from "@/hooks/useWorkouts";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { Skeleton } from "@/components/ui/skeleton";
import WorkoutStats from "@/components/WorkoutStats";
import WorkoutPlayerModal from "@/components/modals/WorkoutPlayerModal";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MyWorkoutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MyWorkoutsModal = ({ open, onOpenChange }: MyWorkoutsModalProps) => {
  const { workouts, isLoading, deleteWorkout, isDeleting } = useWorkouts();
  const { sessions } = useWorkoutSessions();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithExercises | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartWorkout = (workout: WorkoutWithExercises) => {
    if (workout.workout_exercises.length === 0) {
      toast.error("Este treino não possui exercícios");
      return;
    }
    setSelectedWorkout(workout);
    setPlayerOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWorkout(id);
      toast.success("Treino excluído");
    } catch (error) {
      toast.error("Erro ao excluir treino");
    } finally {
      setDeletingId(null);
    }
  };

  // Recent sessions (last 5)
  const recentSessions = sessions
    .filter(s => s.status === "completed")
    .slice(0, 5);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <Play className="text-primary" size={24} />
              Meus Treinos
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Stats */}
            <WorkoutStats />

            {/* User Workouts */}
            <section>
              <h3 className="font-bold text-sm mb-3">Seus Treinos</h3>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : workouts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Dumbbell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Você ainda não criou nenhum treino</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="bg-secondary rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{workout.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {workout.workout_exercises.length} exercícios
                            {workout.objective && ` • ${workout.objective}`}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(workout.id)}
                            disabled={isDeleting}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            {deletingId === workout.id ? (
                              <Loader2 size={16} className="animate-spin text-destructive" />
                            ) : (
                              <Trash2 size={16} className="text-destructive" />
                            )}
                          </button>
                          <button
                            onClick={() => handleStartWorkout(workout)}
                            className="w-10 h-10 wemovelt-gradient rounded-xl flex items-center justify-center"
                          >
                            <Play size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent History */}
            {recentSessions.length > 0 && (
              <section>
                <h3 className="font-bold text-sm mb-3">Histórico Recente</h3>
                <div className="space-y-2">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-secondary/50 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{session.workout_name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(new Date(session.started_at!), "dd/MM", { locale: ptBR })}
                            </span>
                            {session.duration_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {session.duration_minutes} min
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Dumbbell size={12} />
                              {session.exercises_completed}/{session.total_exercises}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-success font-medium">
                          Concluído
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <WorkoutPlayerModal
        workout={selectedWorkout}
        open={playerOpen}
        onOpenChange={setPlayerOpen}
      />
    </>
  );
};

export default MyWorkoutsModal;
