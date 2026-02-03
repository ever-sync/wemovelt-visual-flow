import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import AvatarUpload from "@/components/AvatarUpload";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const objectives = [
  "Emagrecimento",
  "Ganho de massa",
  "Saúde geral",
  "Força",
  "Resistência",
  "Bem-estar",
];

const experienceLevels = [
  { value: "iniciante", label: "Iniciante", description: "Menos de 6 meses" },
  { value: "intermediario", label: "Intermediário", description: "6 meses a 2 anos" },
  { value: "avancado", label: "Avançado", description: "Mais de 2 anos" },
];

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const { user, profile, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    avatar_url: null as string | null,
    age: "" as string | number,
    weight: "" as string | number,
    height: "" as string | number,
    goal: "",
    experience_level: "",
  });

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        avatar_url: profile.avatar_url,
        age: profile.age || "",
        weight: profile.weight || "",
        height: profile.height || "",
        goal: profile.goal || "",
        experience_level: profile.experience_level || "",
      });
    }
  }, [profile]);

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!formData.goal) {
      toast.error("Por favor, selecione um objetivo");
      return;
    }
    if (!formData.experience_level) {
      toast.error("Por favor, selecione seu nível de experiência");
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateProfile({
        name: formData.name.trim(),
        avatar_url: formData.avatar_url,
        age: formData.age ? Number(formData.age) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        height: formData.height ? Number(formData.height) : null,
        goal: formData.goal,
        experience_level: formData.experience_level,
      });

      if (error) throw error;

      toast.success("Perfil configurado com sucesso!");
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }));
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="bg-card border-border max-w-sm mx-4 rounded-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Bem-vindo ao WEMOVELT
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Etapa {step} de 3
          </p>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "wemovelt-gradient" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Photo and Name */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center">
              {user && (
                <AvatarUpload
                  currentUrl={formData.avatar_url}
                  onUpload={handleAvatarUpload}
                  userId={user.id}
                  size="lg"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Como quer ser chamado?</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-12 bg-secondary border-border rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Step 2: Physical Data */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-muted-foreground text-center">
              Esses dados nos ajudam a personalizar seus treinos
            </p>

            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, age: e.target.value }))
                }
                className="h-12 bg-secondary border-border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  className="h-12 bg-secondary border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, height: e.target.value }))
                  }
                  className="h-12 bg-secondary border-border rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goal and Experience */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Qual seu objetivo principal?</Label>
              <div className="flex flex-wrap gap-2">
                {objectives.map((obj) => (
                  <button
                    key={obj}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, goal: obj }))
                    }
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.goal === obj
                        ? "wemovelt-gradient text-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nível de experiência</Label>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        experience_level: level.value,
                      }))
                    }
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      formData.experience_level === level.value
                        ? "wemovelt-gradient"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="flex-1 h-12 rounded-xl"
            >
              <ChevronLeft size={18} className="mr-1" />
              Voltar
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 wemovelt-gradient rounded-xl font-bold"
            >
              Próximo
              <ChevronRight size={18} className="ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 h-12 wemovelt-gradient rounded-xl font-bold"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={18} className="mr-2" />
                  Começar!
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
