import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Clock, X, Check, Pause, Play } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { useEquipmentById } from "@/hooks/useEquipment";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import type { WorkoutWithExercises } from "@/hooks/useWorkouts";
import { toast } from "sonner";

interface WorkoutPlayerModalProps {
  workout: WorkoutWithExercises | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkoutPlayerModal = ({ workout, open, onOpenChange }: WorkoutPlayerModalProps) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const { startSession, completeSession, abandonSession } = useWorkoutSessions();
  
  const exercises = useMemo(() => workout?.workout_exercises ?? [], [workout]);
  const currentExercise = exercises[currentExerciseIndex];
  const { equipment } = useEquipmentById(currentExercise?.equipment_id ?? null);

  // Start session when modal opens
  useEffect(() => {
    if (open && workout && !sessionId) {
      startSession({
        workoutId: workout.id,
        workoutName: workout.name,
        totalExercises: exercises.length,
      }).then((session) => {
        setSessionId(session.id);
        // Initialize completed sets
        const initial: Record<string, boolean[]> = {};
        exercises.forEach((ex) => {
          initial[ex.id] = Array(ex.sets || 3).fill(false);
        });
        setCompletedSets(initial);
      });
    }
    
    if (!open) {
      // Reset state when closing
      setCurrentExerciseIndex(0);
      setCompletedSets({});
      setSessionId(null);
      setElapsedSeconds(0);
      setIsPaused(false);
    }
  }, [open, workout, sessionId, exercises, startSession]);

  // Timer
  useEffect(() => {
    if (!open || isPaused || !sessionId) return;
    
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [open, isPaused, sessionId]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleSet = (exerciseId: string, setIndex: number) => {
    setCompletedSets((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((v, i) => (i === setIndex ? !v : v)),
    }));
  };

  const getCompletedExercisesCount = () => {
    return Object.entries(completedSets).filter(([_, sets]) => 
      sets.every((s) => s)
    ).length;
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    
    await completeSession({
      sessionId,
      exercisesCompleted: getCompletedExercisesCount(),
    });
    
    toast.success("Treino concluído! 💪");
    onOpenChange(false);
  };

  const handleAbandon = async () => {
    if (!sessionId) return;
    
    await abandonSession(sessionId);
    toast.info("Treino abandonado");
    onOpenChange(false);
  };

  if (!workout || !currentExercise) return null;

  const allSetsCompleted = completedSets[currentExercise.id]?.every((s) => s);
  const canGoNext = currentExerciseIndex < exercises.length - 1;
  const canGoPrev = currentExerciseIndex > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-t-border rounded-t-3xl h-[95vh] p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-bold">{workout.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Exercício {currentExerciseIndex + 1} de {exercises.length}
              </p>
            </div>
            <button
              onClick={handleAbandon}
              className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
            >
              <X size={20} className="text-destructive" />
            </button>
          </div>

          {/* Video */}
          <div className="px-4 py-2">
            <VideoPlayer
              videoUrl={equipment?.video_url}
              imageUrl={equipment?.image_url}
              title={currentExercise.name}
            />
          </div>

          {/* Exercise Info */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
            <div>
              <h3 className="text-xl font-bold">{currentExercise.name}</h3>
              <p className="text-muted-foreground">
                {currentExercise.sets} séries x {currentExercise.reps} repetições
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock size={14} />
                Descanso: {currentExercise.rest_seconds}s
              </p>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Séries</h4>
              {completedSets[currentExercise.id]?.map((completed, index) => (
                <button
                  key={index}
                  onClick={() => toggleSet(currentExercise.id, index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    completed ? "bg-success/20" : "bg-secondary"
                  }`}
                >
                  <Checkbox checked={completed} className="pointer-events-none" />
                  <span>Série {index + 1}</span>
                  {completed && <Check size={16} className="text-success ml-auto" />}
                </button>
              ))}
            </div>

            {/* Notes */}
            {currentExercise.notes && (
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-sm text-muted-foreground">{currentExercise.notes}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-border space-y-3">
            {/* Timer */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 bg-secondary rounded-full"
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>
              <div className="text-2xl font-mono font-bold">
                {formatTime(elapsedSeconds)}
              </div>
            </div>

            {/* Nav Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setCurrentExerciseIndex((prev) => prev - 1)}
                disabled={!canGoPrev}
                className="flex-1 rounded-xl"
              >
                <ChevronLeft size={20} className="mr-1" />
                Anterior
              </Button>
              
              {canGoNext ? (
                <Button
                  onClick={() => setCurrentExerciseIndex((prev) => prev + 1)}
                  className="flex-1 wemovelt-gradient rounded-xl font-bold"
                  disabled={!allSetsCompleted}
                >
                  Próximo
                  <ChevronRight size={20} className="ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="flex-1 wemovelt-gradient rounded-xl font-bold"
                >
                  <Check size={20} className="mr-1" />
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WorkoutPlayerModal;
