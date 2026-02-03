import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Target, BarChart3, Calendar, Sparkles, Dumbbell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAuth } from "@/contexts/AuthContext";
import ExerciseSelector, { SelectedExercise } from "@/components/ExerciseSelector";

interface CreateWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const objectives = [
  { id: "fat_loss", label: "Emagrecimento", icon: "🔥" },
  { id: "muscle_gain", label: "Ganho de massa", icon: "💪" },
  { id: "health", label: "Saúde geral", icon: "❤️" },
  { id: "strength", label: "Força", icon: "🏋️" },
];

const levels = [
  { id: "beginner", label: "Iniciante", description: "Estou começando agora" },
  { id: "intermediate", label: "Intermediário", description: "Já treino há alguns meses" },
  { id: "advanced", label: "Avançado", description: "Treino há mais de 1 ano" },
];

const frequencies = [
  { id: 2, label: "2x por semana" },
  { id: 3, label: "3x por semana" },
  { id: 4, label: "4x por semana" },
  { id: 5, label: "5x por semana" },
];

const CreateWorkoutModal = ({ open, onOpenChange }: CreateWorkoutModalProps) => {
  const { user } = useAuth();
  const { createWorkout, isCreating } = useWorkouts();
  
  const [step, setStep] = useState(1);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);

  const resetForm = () => {
    setStep(1);
    setWorkoutName("");
    setSelectedObjective(null);
    setSelectedLevel(null);
    setSelectedFrequency(null);
    setSelectedExercises([]);
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error("Faça login para criar treinos");
      return;
    }

    if (!workoutName.trim()) {
      toast.error("Dê um nome ao seu treino");
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("Selecione pelo menos um exercício");
      return;
    }

    try {
      await createWorkout({
        name: workoutName.trim(),
        objective: selectedObjective || undefined,
        frequency: selectedFrequency || undefined,
        difficulty: selectedLevel || undefined,
        exercises: selectedExercises.map((ex, index) => ({
          equipment_id: ex.equipment_id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          order_index: index,
        })),
      });
      
      toast.success("Treino criado com sucesso! 🎉");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao criar treino");
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedObjective;
    if (step === 2) return selectedLevel;
    if (step === 3) return selectedFrequency;
    if (step === 4) return selectedExercises.length > 0;
    if (step === 5) return workoutName.trim().length > 0;
    return false;
  };

  const totalSteps = 5;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Plus className="text-primary" size={24} />
            Criar Treino
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i + 1 === step ? "wemovelt-gradient w-6" : i + 1 < step ? "bg-success" : "bg-secondary"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Objective */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Target className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Qual seu objetivo?</h3>
                <p className="text-sm text-muted-foreground">Escolha o foco principal do treino</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjective(obj.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedObjective === obj.id
                        ? "wemovelt-gradient"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{obj.icon}</span>
                    <span className="text-sm font-medium">{obj.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Level */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <BarChart3 className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Qual seu nível?</h3>
                <p className="text-sm text-muted-foreground">Isso ajuda a definir a intensidade</p>
              </div>

              <div className="space-y-3">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedLevel === level.id
                        ? "wemovelt-gradient"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="font-bold block">{level.label}</span>
                    <span className="text-sm opacity-80">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Frequency */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Calendar className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Quantas vezes por semana?</h3>
                <p className="text-sm text-muted-foreground">Defina sua frequência de treino</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {frequencies.map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => setSelectedFrequency(freq.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedFrequency === freq.id
                        ? "wemovelt-gradient"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="text-2xl font-bold block">{freq.id}x</span>
                    <span className="text-xs opacity-80">por semana</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Exercises */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Dumbbell className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Selecione os exercícios</h3>
                <p className="text-sm text-muted-foreground">Escolha e configure cada exercício</p>
              </div>

              <ExerciseSelector
                selectedExercises={selectedExercises}
                onSelect={setSelectedExercises}
              />
            </div>
          )}

          {/* Step 5: Name */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Sparkles className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Dê um nome ao treino</h3>
                <p className="text-sm text-muted-foreground">Um nome para identificar seu treino</p>
              </div>

              <Input
                placeholder="Ex: Treino de Peito e Tríceps"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-secondary border-0 rounded-xl h-12"
              />

              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <h4 className="font-medium text-sm">Resumo do treino:</h4>
                <p className="text-xs text-muted-foreground">
                  Objetivo: {objectives.find(o => o.id === selectedObjective)?.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  Nível: {levels.find(l => l.id === selectedLevel)?.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  Frequência: {selectedFrequency}x por semana
                </p>
                <p className="text-xs text-muted-foreground">
                  Exercícios: {selectedExercises.length}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-xl"
              >
                Voltar
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 wemovelt-gradient rounded-xl font-bold"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={!canProceed() || isCreating}
                className="flex-1 wemovelt-gradient rounded-xl font-bold"
              >
                {isCreating ? (
                  <>
                    <Sparkles className="mr-2 animate-spin" size={18} />
                    Criando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={18} />
                    Criar Treino
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkoutModal;
