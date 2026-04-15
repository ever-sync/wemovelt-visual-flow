import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Target, BarChart3, Calendar, Sparkles, Dumbbell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAuth } from "@/contexts/AuthContext";
import { useEquipment, type Equipment } from "@/hooks/useEquipment";
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

const goalToObjectiveMap: Record<string, string> = {
  emagrecimento: "fat_loss",
  "ganho de massa": "muscle_gain",
  "saúde geral": "health",
  "saude geral": "health",
  força: "strength",
  forca: "strength",
};

const experienceToLevelMap: Record<string, string> = {
  iniciante: "beginner",
  intermediario: "intermediate",
  avançado: "advanced",
  avancado: "advanced",
};

const frequencyByLevel: Record<string, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5,
};

const frequencyByObjective: Record<string, number> = {
  fat_loss: 4,
  muscle_gain: 4,
  health: 3,
  strength: 4,
};

const objectiveKeywords: Record<string, string[]> = {
  fat_loss: ["cardio", "aerob", "perna", "agach", "abd", "core", "lombar"],
  muscle_gain: ["supino", "remada", "ombro", "peito", "costas", "biceps", "triceps", "perna", "desenvolvimento"],
  health: ["funcional", "mobilidade", "saude", "bem", "core", "lombar", "perna", "ombro"],
  strength: ["forca", "supino", "agach", "remada", "desenvolvimento", "costas", "peito", "perna"],
};

const targetExerciseCountByFrequency: Record<number, number> = {
  2: 6,
  3: 8,
  4: 10,
  5: 12,
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const equipmentSearchText = (equipment: Equipment) => {
  const muscles = equipment.muscles?.join(" ") ?? "";
  return normalize(
    [equipment.name, equipment.category ?? "", muscles, equipment.description ?? "", equipment.primary_function ?? ""].join(" ")
  );
};

const buildPrescription = (objective: string, level: string, age: number | null) => {
  let sets = level === "advanced" ? 4 : 3;
  let reps = "10-12";
  let rest = 60;

  if (objective === "fat_loss") {
    reps = "12-15";
    rest = 45;
  }
  if (objective === "muscle_gain") {
    reps = "8-12";
    rest = 75;
  }
  if (objective === "health") {
    reps = "10-15";
    rest = 60;
  }
  if (objective === "strength") {
    reps = "4-8";
    rest = 120;
  }

  if (level === "beginner") {
    rest += 15;
  }
  if (level === "advanced" && objective !== "strength") {
    rest = Math.max(45, rest - 10);
  }
  if (age !== null && age >= 50) {
    rest += 15;
  }
  if (age !== null && age >= 60) {
    sets = Math.max(2, sets - 1);
    reps = objective === "strength" ? "6-10" : reps;
  }

  return { sets, reps, rest };
};

const CreateWorkoutModal = ({ open, onOpenChange }: CreateWorkoutModalProps) => {
  const { user, profile } = useAuth();
  const { createWorkout, isCreating } = useWorkouts();
  const { equipment, isLoading: isLoadingEquipment } = useEquipment();
  
  const [step, setStep] = useState(1);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [hasAppliedSuggestion, setHasAppliedSuggestion] = useState(false);

  const resetForm = () => {
    setStep(1);
    setWorkoutName("");
    setSelectedObjective(null);
    setSelectedLevel(null);
    setSelectedFrequency(null);
    setSelectedExercises([]);
    setHasAppliedSuggestion(false);
  };

  const recommendedObjective = profile?.goal
    ? goalToObjectiveMap[profile.goal.trim().toLowerCase()] ?? null
    : null;
  const recommendedLevel = profile?.experience_level
    ? experienceToLevelMap[profile.experience_level.trim().toLowerCase()] ?? null
    : null;
  const recommendedFrequency =
    (recommendedLevel ? frequencyByLevel[recommendedLevel] : null) ??
    (recommendedObjective ? frequencyByObjective[recommendedObjective] : null) ??
    3;

  const recommendedObjectiveLabel = objectives.find((item) => item.id === recommendedObjective)?.label ?? null;
  const recommendedLevelLabel = levels.find((item) => item.id === recommendedLevel)?.label ?? null;

  const buildSuggestedWorkoutName = () => {
    const objectiveLabel = objectives.find((item) => item.id === selectedObjective)?.label ?? "Personalizado";
    const frequencyLabel = selectedFrequency ? ` ${selectedFrequency}x` : "";
    return `${objectiveLabel}${frequencyLabel}`.trim();
  };

  const applySmartSuggestion = () => {
    if (recommendedObjective) setSelectedObjective(recommendedObjective);
    if (recommendedLevel) setSelectedLevel(recommendedLevel);
    if (!selectedFrequency) setSelectedFrequency(recommendedFrequency);
    setHasAppliedSuggestion(true);
    toast.success("Sugestões do seu perfil aplicadas.");
  };

  const handleAutoBuildExercises = () => {
    if (!equipment.length) {
      toast.error("Ainda não há equipamentos cadastrados para montar o treino.");
      return;
    }

    const effectiveObjective = selectedObjective ?? recommendedObjective ?? "health";
    const effectiveLevel = selectedLevel ?? recommendedLevel ?? "beginner";
    const frequency = selectedFrequency ?? recommendedFrequency ?? 3;
    const targetCount = targetExerciseCountByFrequency[frequency] ?? 8;
    const keywords = objectiveKeywords[effectiveObjective] ?? objectiveKeywords.health;
    const prescription = buildPrescription(effectiveObjective, effectiveLevel, profile?.age ?? null);

    const scored = equipment
      .map((item) => {
        const text = equipmentSearchText(item);
        const score = keywords.reduce((acc, keyword) => (text.includes(keyword) ? acc + 1 : acc), 0);
        return { item, score };
      })
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));

    const pool = scored.map((entry) => entry.item);
    const selected: Equipment[] = [];
    const categoryUsage = new Map<string, number>();
    const maxPerCategory = Math.max(2, Math.ceil(targetCount / 3));

    for (const eq of pool) {
      if (selected.length >= targetCount) break;
      const categoryKey = eq.category ?? "sem_categoria";
      const usage = categoryUsage.get(categoryKey) ?? 0;
      if (usage >= maxPerCategory) continue;
      selected.push(eq);
      categoryUsage.set(categoryKey, usage + 1);
    }

    if (selected.length < targetCount) {
      for (const eq of pool) {
        if (selected.length >= targetCount) break;
        if (selected.some((item) => item.id === eq.id)) continue;
        selected.push(eq);
      }
    }

    const generated = selected.map((eq, index) => ({
      equipment_id: eq.id,
      name: eq.name,
      sets: prescription.sets,
      reps: prescription.reps,
      rest_seconds: prescription.rest,
      order_index: index,
    }));

    setSelectedExercises(
      generated.map(({ equipment_id, name, sets, reps, rest_seconds }) => ({
        equipment_id,
        name,
        sets,
        reps,
        rest_seconds,
      }))
    );

    toast.success(`Treino montado automaticamente com ${generated.length} exercícios.`);
  };

  useEffect(() => {
    if (!open) return;
    if (hasAppliedSuggestion) return;
    if (!recommendedObjective && !recommendedLevel) return;

    if (!selectedObjective && recommendedObjective) {
      setSelectedObjective(recommendedObjective);
    }
    if (!selectedLevel && recommendedLevel) {
      setSelectedLevel(recommendedLevel);
    }
    if (!selectedFrequency) {
      setSelectedFrequency(recommendedFrequency);
    }
    setHasAppliedSuggestion(true);
  }, [
    open,
    hasAppliedSuggestion,
    recommendedObjective,
    recommendedLevel,
    recommendedFrequency,
    selectedObjective,
    selectedLevel,
    selectedFrequency,
  ]);

  useEffect(() => {
    if (step !== 5) return;
    if (workoutName.trim()) return;
    setWorkoutName(buildSuggestedWorkoutName());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedObjective, selectedFrequency]);

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
      <DialogContent className="w-[calc(100vw-1rem)] max-w-sm animate-scale-in overflow-hidden rounded-2xl border-border bg-card p-0 sm:max-w-[26rem]">
        <div className="flex max-h-[84dvh] min-w-0 flex-col">
          <DialogHeader className="px-4 pb-2 pt-4 sm:px-6">
            <DialogTitle className="flex items-center justify-center gap-2 text-center text-xl font-bold">
              <Plus className="text-primary" size={24} />
              Criar Treino
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-5">
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

              {(recommendedObjectiveLabel || recommendedLevelLabel) && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">Sugestão inteligente para você:</p>
                      <p className="text-xs font-semibold leading-tight">
                        {recommendedObjectiveLabel ?? "Objetivo personalizado"}
                        {recommendedLevelLabel ? ` • ${recommendedLevelLabel}` : ""}
                        {recommendedFrequency ? ` • ${recommendedFrequency}x por semana` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={applySmartSuggestion}
                      variant="secondary"
                      className="h-8 w-full rounded-lg px-3 text-[11px] sm:w-auto sm:shrink-0"
                    >
                      Aplicar sugestão
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjective(obj.id)}
                    className={`min-h-[96px] rounded-xl px-2 py-3 text-center transition-all sm:p-4 ${
                      selectedObjective === obj.id
                        ? "wemovelt-gradient"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="mb-1 block text-xl sm:text-2xl">{obj.icon}</span>
                    <span className="text-xs font-medium sm:text-sm">{obj.label}</span>
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

              {selectedLevel && (
                <p className="text-center text-xs text-muted-foreground">
                  Recomendado para seu nível: <span className="font-semibold text-foreground">{recommendedFrequency}x por semana</span>
                </p>
              )}

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
            <div className="min-w-0 space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Dumbbell className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Selecione os exercícios</h3>
                <p className="text-sm text-muted-foreground">Escolha e configure cada exercício</p>
              </div>

              <div className="min-w-0 rounded-xl border border-primary/25 bg-primary/10 p-3">
                <p className="text-xs text-muted-foreground">
                  Montagem inteligente: usa objetivo + anamnese + frequência para sugerir automaticamente.
                </p>
                <Button
                  type="button"
                  onClick={handleAutoBuildExercises}
                  variant="secondary"
                  className="mt-2 min-h-11 w-full rounded-xl px-4 py-3 text-center text-sm leading-tight whitespace-normal"
                  disabled={isLoadingEquipment}
                >
                  {isLoadingEquipment ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Carregando equipamentos...
                    </>
                  ) : (
                    "Montar treino automaticamente"
                  )}
                </Button>
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
          <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-border bg-card/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur sm:-mx-5 sm:px-5">
            <div className="flex gap-3">
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
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkoutModal;
