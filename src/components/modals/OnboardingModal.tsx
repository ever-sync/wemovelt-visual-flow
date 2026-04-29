import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvatarUpload from "@/components/AvatarUpload";
import BrandLockup from "@/components/brand/BrandLockup";
import { useAuth } from "@/contexts/AuthContext";
import { MINIMUM_ACCOUNT_AGE } from "@/lib/ageGate";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const objectives = ["Emagrecimento", "Ganho de massa", "Saude geral", "Forca", "Resistencia", "Bem-estar"];

const experienceLevels = [
  { value: "iniciante", label: "Iniciante", description: "Menos de 6 meses" },
  { value: "intermediario", label: "Intermediario", description: "6 meses a 2 anos" },
  { value: "avancado", label: "Avancado", description: "Mais de 2 anos" },
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
      toast.error("Por favor, selecione seu nivel de experiencia");
      return;
    }

    if (formData.age && Number(formData.age) < MINIMUM_ACCOUNT_AGE) {
      toast.error("O WEMOVELT e exclusivo para maiores de 18 anos");
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

      if (error) {
        throw error;
      }

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
        className="app-panel scrollbar-hide max-h-[90vh] max-w-sm overflow-y-auto rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6">
          <div className="rounded-[1.6rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(255,102,0,0.18),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
            <div className="space-y-4">
              <BrandLockup compact iconClassName="h-9 w-9" kickerClassName="text-[0.58rem]" titleClassName="text-sm" />
              <div className="space-y-2">
                <DialogTitle className="text-left text-[1.55rem] font-bold tracking-[-0.06em]">
                  Configure seu ritmo
                </DialogTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  Etapa {step} de 3 para personalizar o app com mais contexto.
                </p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((currentStep) => (
                  <div
                    key={currentStep}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      currentStep <= step ? "wemovelt-gradient" : "bg-white/[0.08]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-center">
                {user && (
                  <AvatarUpload currentUrl={formData.avatar_url} onUpload={handleAvatarUpload} userId={user.id} size="lg" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Como quer ser chamado?</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="h-12 rounded-[1rem] border-white/10 bg-white/[0.03]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-center text-sm text-muted-foreground">
                Esses dados ajudam a calibrar melhor seus treinos e metas.
              </p>

              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  min={MINIMUM_ACCOUNT_AGE}
                  placeholder="25"
                  value={formData.age}
                  onChange={(event) => setFormData((prev) => ({ ...prev, age: event.target.value }))}
                  className="h-12 rounded-[1rem] border-white/10 bg-white/[0.03]"
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
                    onChange={(event) => setFormData((prev) => ({ ...prev, weight: event.target.value }))}
                    className="h-12 rounded-[1rem] border-white/10 bg-white/[0.03]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.height}
                    onChange={(event) => setFormData((prev) => ({ ...prev, height: event.target.value }))}
                    className="h-12 rounded-[1rem] border-white/10 bg-white/[0.03]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label>Qual seu objetivo principal?</Label>
                <div className="flex flex-wrap gap-2">
                  {objectives.map((objective) => (
                    <button
                      key={objective}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, goal: objective }))}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${
                        formData.goal === objective
                          ? "wemovelt-gradient text-primary-foreground"
                          : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06]"
                      }`}
                    >
                      {objective}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nivel de experiencia</Label>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, experience_level: level.value }))}
                      className={`w-full rounded-[1.2rem] border p-3 text-left transition-all ${
                        formData.experience_level === level.value
                          ? "border-primary/25 bg-primary/10"
                          : "border-white/8 bg-white/[0.03] hover:border-primary/20"
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={handleBack} className="h-12 flex-1 rounded-full">
                <ChevronLeft size={18} className="mr-1" />
                Voltar
              </Button>
            )}

            {step < 3 ? (
              <Button type="button" onClick={handleNext} className="h-12 flex-1 rounded-full font-semibold">
                Proximo
                <ChevronRight size={18} className="ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={handleComplete} disabled={saving} className="h-12 flex-1 rounded-full font-semibold">
                {saving ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Comecar
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

export default OnboardingModal;
