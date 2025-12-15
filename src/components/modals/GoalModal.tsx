import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Calendar, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const presetGoals = [
  { label: "Treinar 3x/semana", value: 3 },
  { label: "Treinar 4x/semana", value: 4 },
  { label: "Treinar 5x/semana", value: 5 },
];

const GoalModal = ({ open, onOpenChange }: GoalModalProps) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  const handleCreate = () => {
    if (selectedGoal) {
      setStep("success");
    }
  };

  const handleClose = () => {
    setStep("form");
    setSelectedGoal(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                <Target className="text-primary" size={24} />
                Criar Meta
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Label className="text-foreground">Escolha sua meta semanal</Label>
              
              <div className="space-y-2">
                {presetGoals.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedGoal(value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedGoal === value 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedGoal === value ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {selectedGoal === value && <div className="w-2 h-2 bg-foreground rounded-full" />}
                      </div>
                      <span className="font-medium">{label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleCreate}
                  disabled={!selectedGoal}
                  className="w-full h-12 wemovelt-gradient rounded-xl font-bold disabled:opacity-50"
                >
                  Criar meta
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
              Sua meta de treinar {selectedGoal}x por semana foi salva.<br/>
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
