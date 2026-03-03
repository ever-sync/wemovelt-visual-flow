import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import { Loader2, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  usage_instructions?: string | null;
  primary_function?: string | null;
}

interface EquipmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment | null;
  onSubmit: (data: Omit<Equipment, "id"> & { id?: string }) => void;
  isLoading?: boolean;
}


const STEP_LABELS = ["Básico", "Detalhes", "Classificação", "Especificações"];

const EquipmentForm = ({
  open,
  onOpenChange,
  equipment,
  onSubmit,
  isLoading,
}: EquipmentFormProps) => {
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    usage_instructions: "",
    primary_function: "",
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
        usage_instructions: equipment.usage_instructions || "",
        primary_function: equipment.primary_function || "",
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
        usage_instructions: "",
        primary_function: "",
      });
    }
    setStep(1);
    setImageFile(null);
  }, [equipment, open]);

  const toggleMuscle = (muscle: string) => {
    setFormData((prev) => ({
      ...prev,
      muscles: prev.muscles.includes(muscle)
        ? prev.muscles.filter((m) => m !== muscle)
        : [...prev.muscles, muscle],
    }));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null;
    
    const fileExt = imageFile.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('equipment-images')
      .upload(filePath, imageFile);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('equipment-images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  const deleteOldImage = async (url: string) => {
    try {
      const path = url.split('/equipment-images/')[1];
      if (path) {
        await supabase.storage.from('equipment-images').remove([path]);
      }
    } catch {}
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      const filteredSpecs = formData.specifications.filter((s) => s.trim() !== "");
      
      let imageUrl = formData.image_url || null;
      if (imageFile) {
        // Delete old image if editing
        if (equipment?.image_url && equipment.image_url.includes('equipment-images')) {
          await deleteOldImage(equipment.image_url);
        }
        imageUrl = await uploadImage();
      }
      
      const data = {
        ...formData,
        description: formData.description || null,
        video_url: formData.video_url || null,
        category: formData.category || null,
        difficulty: formData.difficulty || null,
        gym_id: formData.gym_id || null,
        image_url: imageUrl,
        muscles: formData.muscles.length > 0 ? formData.muscles : null,
        specifications: filteredSpecs.length > 0 ? filteredSpecs : null,
        usage_instructions: formData.usage_instructions || null,
        primary_function: formData.primary_function || null,
        ...(equipment?.id && { id: equipment.id }),
      };
      onSubmit(data);
    } catch (error: any) {
      alert('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {equipment ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>

        {/* Stepper indicator */}
        <div className="flex items-center justify-between px-2">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNum}
                </div>
                <span className={`text-xs ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 py-2">
          {/* Step 1: Básico */}
          {step === 1 && (
            <>
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
                <Label>Imagem do Equipamento</Label>
                {equipment?.image_url && !imageFile && (
                  <img src={equipment.image_url} alt="Imagem atual" className="w-full h-32 object-cover rounded-xl mb-2" />
                )}
                <ImageUpload
                  onImageSelect={setImageFile}
                  selectedImage={imageFile}
                />
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
            </>
          )}

          {/* Step 2: Detalhes */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o equipamento..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_function">Função Principal</Label>
                <Input
                  id="primary_function"
                  value={formData.primary_function}
                  onChange={(e) => setFormData({ ...formData, primary_function: e.target.value })}
                  placeholder="Ex: Fortalecimento de peitoral e tríceps"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_instructions">Modo de Uso</Label>
                <Textarea
                  id="usage_instructions"
                  value={formData.usage_instructions}
                  onChange={(e) => setFormData({ ...formData, usage_instructions: e.target.value })}
                  placeholder="Explique como usar o equipamento passo a passo..."
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Step 3: Classificação */}
          {step === 3 && (
            <>
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
            </>
          )}

          {/* Step 4: Especificações */}
          {step === 4 && (
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
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 pt-2">
          {step === 1 ? (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          )}

          {step < 4 ? (
            <Button
              type="button"
              className="flex-1"
              disabled={step === 1 && !formData.name.trim()}
              onClick={() => setStep(step + 1)}
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1"
              disabled={isLoading || isUploading}
              onClick={handleSubmit}
            >
              {isLoading || isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : equipment ? (
                "Salvar"
              ) : (
                "Criar"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentForm;
