import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGyms } from "@/hooks/useGyms";
import { Loader2, Plus, X } from "lucide-react";

const MUSCLES = [
  { value: "Peitoral", label: "Peitoral" },
  { value: "Costas", label: "Costas" },
  { value: "Bíceps", label: "Bíceps" },
  { value: "Tríceps", label: "Tríceps" },
  { value: "Ombros", label: "Ombros" },
  { value: "Quadríceps", label: "Quadríceps" },
  { value: "Posterior", label: "Posterior" },
  { value: "Glúteos", label: "Glúteos" },
  { value: "Panturrilha", label: "Panturrilha" },
  { value: "Abdômen", label: "Abdômen" },
  { value: "Core", label: "Core" },
  { value: "Antebraço", label: "Antebraço" },
];

interface Equipment {
  id: string;
  name: string;
  description?: string | null;
  video_url?: string | null;
  category?: string | null;
  difficulty?: string | null;
  gym_id?: string | null;
  muscles?: string[] | null;
  image_url?: string | null;
  specifications?: string[] | null;
}

interface EquipmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment | null;
  onSubmit: (data: Omit<Equipment, "id"> & { id?: string }) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  { value: "peito", label: "Peito" },
  { value: "costas", label: "Costas" },
  { value: "pernas", label: "Pernas" },
  { value: "bracos", label: "Braços" },
  { value: "ombros", label: "Ombros" },
  { value: "abdomen", label: "Abdômen" },
  { value: "cardio", label: "Cardio" },
  { value: "funcional", label: "Funcional" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];

const EquipmentForm = ({
  open,
  onOpenChange,
  equipment,
  onSubmit,
  isLoading,
}: EquipmentFormProps) => {
  const { gyms } = useGyms();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    video_url: "",
    category: "",
    difficulty: "",
    gym_id: "",
    image_url: "",
    muscles: [] as string[],
    specifications: [] as string[],
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || "",
        description: equipment.description || "",
        video_url: equipment.video_url || "",
        category: equipment.category || "",
        difficulty: equipment.difficulty || "",
        gym_id: equipment.gym_id || "",
        image_url: equipment.image_url || "",
        muscles: equipment.muscles || [],
        specifications: equipment.specifications || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        video_url: "",
        category: "",
        difficulty: "",
        gym_id: "",
        image_url: "",
        muscles: [],
        specifications: [],
      });
    }
  }, [equipment, open]);

  const toggleMuscle = (muscle: string) => {
    setFormData((prev) => ({
      ...prev,
      muscles: prev.muscles.includes(muscle)
        ? prev.muscles.filter((m) => m !== muscle)
        : [...prev.muscles, muscle],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredSpecs = formData.specifications.filter((s) => s.trim() !== "");
    const data = {
      ...formData,
      description: formData.description || null,
      video_url: formData.video_url || null,
      category: formData.category || null,
      difficulty: formData.difficulty || null,
      gym_id: formData.gym_id || null,
      image_url: formData.image_url || null,
      muscles: formData.muscles.length > 0 ? formData.muscles : null,
      specifications: filteredSpecs.length > 0 ? filteredSpecs : null,
      ...(equipment?.id && { id: equipment.id }),
    };
    
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {equipment ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Barra Fixa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o equipamento e como usar..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Músculos Trabalhados</Label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
              {MUSCLES.map((muscle) => (
                <div key={muscle.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`muscle-${muscle.value}`}
                    checked={formData.muscles.includes(muscle.value)}
                    onCheckedChange={() => toggleMuscle(muscle.value)}
                  />
                  <Label
                    htmlFor={`muscle-${muscle.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {muscle.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Link do Vídeo (YouTube)</Label>
            <Input
              id="video_url"
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category || undefined}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select
                value={formData.difficulty || undefined}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Academia</Label>
            <Select
              value={formData.gym_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, gym_id: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vincular a uma academia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {gyms?.map((gym) => (
                  <SelectItem key={gym.id} value={gym.id}>
                    {gym.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Especificações Técnicas</Label>
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={spec}
                    onChange={(e) => {
                      const updated = [...formData.specifications];
                      updated[index] = e.target.value;
                      setFormData({ ...formData, specifications: updated });
                    }}
                    placeholder="Ex: Carga máxima: 150kg"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => {
                      const updated = formData.specifications.filter((_, i) => i !== index);
                      setFormData({ ...formData, specifications: updated });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({ ...formData, specifications: [...formData.specifications, ""] })
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar especificação
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : equipment ? (
                "Salvar"
              ) : (
                "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentForm;
