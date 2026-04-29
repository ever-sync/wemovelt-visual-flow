import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save, Loader2, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import AvatarUpload from "@/components/AvatarUpload";
import { profileSchema, validateSafe } from "@/lib/validations";
import { sanitizeText, sanitizeInteger } from "@/lib/sanitize";
import { MINIMUM_ACCOUNT_AGE } from "@/lib/ageGate";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { user, profile, updateProfile } = useAuth();
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

  // Initialize form data when modal opens or profile changes
  useEffect(() => {
    if (profile && open) {
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
  }, [profile, open]);

  const handleSave = async () => {
    if (formData.age && Number(formData.age) < MINIMUM_ACCOUNT_AGE) {
      toast.error("O WEMOVELT e exclusivo para maiores de 18 anos");
      return;
    }

    // Sanitize all inputs
    const sanitizedData = {
      name: sanitizeText(formData.name),
      age: sanitizeInteger(formData.age, MINIMUM_ACCOUNT_AGE, 120),
      weight: sanitizeInteger(formData.weight, 20, 500),
      height: sanitizeInteger(formData.height, 50, 300),
      goal: formData.goal || null,
      experience_level: formData.experience_level || null,
    };

    // Validate with Zod
    const result = validateSafe(profileSchema, sanitizedData);
    if (!result.success) {
      const errorResult = result as { success: false; error: string };
      toast.error(errorResult.error);
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateProfile({
        name: sanitizedData.name,
        avatar_url: formData.avatar_url,
        age: sanitizedData.age,
        weight: sanitizedData.weight,
        height: sanitizedData.height,
        goal: sanitizedData.goal,
        experience_level: sanitizedData.experience_level,
      });

      if (error) throw error;

      toast.success("Perfil salvo com sucesso!");
      onOpenChange(false);
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

  const toggleObjective = (obj: string) => {
    setFormData((prev) => ({
      ...prev,
      goal: prev.goal === obj ? "" : obj,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-sm rounded-2xl border-border bg-card animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <User className="text-primary" size={24} />
            Meu Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Avatar */}
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="name"
                placeholder="Seu nome completo"
                className="pl-10 h-12 bg-secondary border-border rounded-xl"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Physical data */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-foreground text-sm">Idade</Label>
              <Input
                id="age"
                type="number"
                min={MINIMUM_ACCOUNT_AGE}
                placeholder="25"
                className="h-12 bg-secondary border-border rounded-xl text-center"
                value={formData.age}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, age: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="text-foreground text-sm">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                className="h-12 bg-secondary border-border rounded-xl text-center"
                value={formData.weight}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, weight: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-foreground text-sm">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                className="h-12 bg-secondary border-border rounded-xl text-center"
                value={formData.height}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, height: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <Target size={16} className="text-primary" />
              Objetivo
            </Label>
            <div className="flex flex-wrap gap-2">
              {objectives.map((obj) => (
                <button
                  key={obj}
                  type="button"
                  onClick={() => toggleObjective(obj)}
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

          {/* Experience level */}
          <div className="space-y-2">
            <Label className="text-foreground">Nível de experiência</Label>
            <div className="flex gap-2">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      experience_level: prev.experience_level === level.value ? "" : level.value,
                    }))
                  }
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.experience_level === level.value
                      ? "wemovelt-gradient text-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 text-lg font-bold wemovelt-gradient rounded-xl mt-4"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Salvar Perfil
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
