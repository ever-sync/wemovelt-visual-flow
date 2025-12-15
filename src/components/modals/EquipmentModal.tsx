import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Play, AlertTriangle, CheckCircle } from "lucide-react";

interface Equipment {
  id: number;
  name: string;
  image: string;
  muscles: string;
}

interface EquipmentModalProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const instructions = [
  "Ajuste o banco na posição adequada para seu corpo",
  "Mantenha os pés firmes no chão durante todo o movimento",
  "Controle a descida - não deixe o peso cair",
  "Expire ao empurrar, inspire ao descer",
];

const tips = [
  { icon: CheckCircle, text: "Mantenha a coluna apoiada no banco", type: "good" },
  { icon: AlertTriangle, text: "Não trave os cotovelos completamente", type: "warning" },
];

const EquipmentModal = ({ equipment, open, onOpenChange }: EquipmentModalProps) => {
  if (!equipment) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-t-border rounded-t-3xl h-[85vh] p-0">
        <div className="overflow-y-auto h-full">
          {/* Video placeholder */}
          <div className="relative aspect-video bg-secondary">
            <img 
              src={equipment.image} 
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <button className="w-16 h-16 wemovelt-gradient rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <Play size={32} className="ml-1" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Vídeo demonstrativo</p>
                <p className="font-bold">{equipment.name}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-left">
                {equipment.name}
              </SheetTitle>
              <p className="text-muted-foreground text-left">
                Músculos: <span className="text-primary">{equipment.muscles}</span>
              </p>
            </SheetHeader>

            {/* Instructions */}
            <section>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                Como executar
              </h3>
              <ol className="space-y-3">
                {instructions.map((instruction, index) => (
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

            <Button className="w-full h-14 wemovelt-gradient rounded-2xl font-bold text-lg">
              Iniciar exercício
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EquipmentModal;
