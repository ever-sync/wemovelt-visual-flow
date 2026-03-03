import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Plus } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import AddToWorkoutModal from "./AddToWorkoutModal";
import { useState } from "react";
import type { Equipment } from "@/hooks/useEquipment";

interface EquipmentModalProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EquipmentModal = ({ equipment, open, onOpenChange }: EquipmentModalProps) => {
  const [addToWorkoutOpen, setAddToWorkoutOpen] = useState(false);

  if (!equipment) return null;

  // Generate instructions based on equipment
  const getInstructions = () => {
    if (equipment.usage_instructions) {
      return equipment.usage_instructions.split('\n').filter(line => line.trim());
    }
    if (equipment.description) {
      return [equipment.description];
    }
    return [
      "Ajuste o equipamento na posição adequada para seu corpo",
      "Mantenha a postura correta durante todo o movimento",
      "Controle a descida - não deixe o peso cair",
      "Expire ao fazer força, inspire ao retornar",
    ];
  };

  const tips = [
    { icon: CheckCircle, text: "Mantenha a coluna neutra durante o exercício", type: "good" },
    { icon: AlertTriangle, text: "Evite movimentos bruscos ou com impulso", type: "warning" },
  ];

  const handleAddToWorkout = () => {
    setAddToWorkoutOpen(true);
  };

  const handleAddSuccess = () => {
    // Close the equipment modal after successful add
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="bg-card border-t-border rounded-t-3xl h-[85vh] p-0">
          <div className="overflow-y-auto scrollbar-hide h-full">
            {/* Video */}
            <div className="p-4">
              <VideoPlayer
                videoUrl={equipment.video_url}
                imageUrl={equipment.image_url}
                title={equipment.name}
              />
            </div>

            <div className="px-6 pb-6 space-y-6">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-left">
                  {equipment.name}
                </SheetTitle>
                <p className="text-muted-foreground text-left">
                  Músculos: <span className="text-primary">{equipment.muscles?.join(", ") || "Não especificado"}</span>
                </p>
                {equipment.primary_function && (
                  <p className="text-sm text-muted-foreground text-left">
                    Função: <span className="text-primary">{equipment.primary_function}</span>
                  </p>
                )}
                {equipment.difficulty && (
                  <p className="text-sm text-muted-foreground text-left">
                    Dificuldade: <span className="capitalize">{equipment.difficulty}</span>
                  </p>
                )}
              </SheetHeader>

              {/* Description */}
              {equipment.description && (
                <section>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Descrição
                  </h3>
                  <p className="text-muted-foreground text-sm">{equipment.description}</p>
                </section>
              )}

              {/* Instructions */}
              <section>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Como executar
                </h3>
                <ol className="space-y-3">
                  {getInstructions().map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 wemovelt-gradient rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Tips */}
              <section>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Dicas importantes
                </h3>
                <div className="space-y-2">
                  {tips.map(({ icon: Icon, text, type }, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        type === "good" ? "bg-success/10" : "bg-yellow-500/10"
                      }`}
                    >
                      <Icon size={20} className={type === "good" ? "text-success" : "text-yellow-500"} />
                      <span className="text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </section>

              <Button 
                onClick={handleAddToWorkout}
                className="w-full h-14 wemovelt-gradient rounded-2xl font-bold text-lg"
              >
                <Plus size={20} className="mr-2" />
                Adicionar ao Treino
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AddToWorkoutModal
        equipment={equipment}
        open={addToWorkoutOpen}
        onOpenChange={setAddToWorkoutOpen}
        onSuccess={handleAddSuccess}
      />
    </>
  );
};

export default EquipmentModal;
