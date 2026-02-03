import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Target, CheckCircle2, Dumbbell, Droplets, Moon, Apple, Loader2 } from "lucide-react";
import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const goalTypes = [
  { 
    type: "workout", 
    icon: Dumbbell, 
    label: "Treino", 
    presets: [
      { label: "3x/semana", value: 3 },
      { label: "4x/semana", value: 4 },
      { label: "5x/semana", value: 5 },
    ],
    unit: "times_per_week",
  },
  { 
    type: "hydration", 
    icon: Droplets, 
    label: "Hidratação", 
    presets: [
      { label: "5 dias/semana", value: 5 },
      { label: "6 dias/semana", value: 6 },
      { label: "7 dias/semana", value: 7 },
    ],
    unit: "times_per_week",
  },
  { 
    type: "sleep", 
    icon: Moon, 
    label: "Sono", 
    presets: [
      { label: "5 dias/semana", value: 5 },
      { label: "6 dias/semana", value: 6 },
      { label: "7 dias/semana", value: 7 },
    ],
    unit: "times_per_week",
  },
  { 
    type: "nutrition", 
    icon: Apple, 
    label: "Alimentação", 
    presets: [
      { label: "5 dias/semana", value: 5 },
      { label: "6 dias/semana", value: 6 },
      { label: "7 dias/semana", value: 7 },
    ],
    unit: "times_per_week",
  },
];

const GoalModal = ({ open, onOpenChange }: GoalModalProps) => {
  const [step, setStep] = useState<"type" | "target" | "success">("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const { createGoal, isCreating } = useGoals();

  const selectedGoalType = goalTypes.find(g => g.type === selectedType);

  const handleCreate = async () => {
    if (!selectedType || !selectedTarget || !selectedGoalType) return;
    
    const title = selectedType === "workout" 
      ? `Treinar ${selectedTarget}x/semana`
      : `${selectedGoalType.label} ${selectedTarget} dias/semana`;
    
    try {
      await createGoal({
        type: selectedType,
        target: selectedTarget,
        unit: selectedGoalType.unit,
        title,
      });
      setStep("success");
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleClose = () => {
    setStep("type");
    setSelectedType(null);
    setSelectedTarget(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl">
        {step === "type" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                <Target className="text-primary" size={24} />
                Criar Meta
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Label className="text-foreground">Escolha o tipo de meta</Label>
              
              <div className="grid grid-cols-2 gap-3">
                {goalTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setStep("target");
                    }}
                    className="p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-center"
                  >
                    <Icon className="mx-auto mb-2 text-primary" size={28} />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === "target" && selectedGoalType && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                <selectedGoalType.icon className="text-primary" size={24} />
                Meta de {selectedGoalType.label}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Label className="text-foreground">Escolha sua meta semanal</Label>
              
              <div className="space-y-2">
                {selectedGoalType.presets.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedTarget(value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTarget === value 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTarget === value ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {selectedTarget === value && <div className="w-2 h-2 bg-foreground rounded-full" />}
                      </div>
                      <span className="font-medium">{label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStep("type");
                    setSelectedTarget(null);
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!selectedTarget || isCreating}
                  className="flex-1 h-12 wemovelt-gradient rounded-xl font-bold disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Criar meta"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="py-8 flex flex-col items-center animate-bounce-in">
            <div className="w-20 h-20 wemovelt-gradient rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">Meta criada!</h3>
            <p className="text-muted-foreground text-center text-sm mb-6">
              Sua meta foi salva com sucesso.<br/>
              Vamos juntos alcançar esse objetivo! 💪
            </p>
            <Button 
              onClick={handleClose}
              className="wemovelt-gradient rounded-xl px-8"
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;
