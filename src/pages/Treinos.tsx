import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Play, Plus, Calendar, Dumbbell } from "lucide-react";
import { useState } from "react";
import EquipmentModal from "@/components/modals/EquipmentModal";

const workoutCards = [
  { icon: Play, label: "Meus treinos", color: "wemovelt-gradient" },
  { icon: Calendar, label: "Treino do dia", color: "bg-secondary" },
  { icon: Plus, label: "Criar treino", color: "bg-secondary" },
];

const equipments = [
  { id: 1, name: "Supino", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop", muscles: "Peito, Tríceps" },
  { id: 2, name: "Leg Press", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop", muscles: "Quadríceps, Glúteos" },
  { id: 3, name: "Puxada", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=200&h=200&fit=crop", muscles: "Costas, Bíceps" },
  { id: 4, name: "Cadeira Extensora", image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=200&h=200&fit=crop", muscles: "Quadríceps" },
  { id: 5, name: "Desenvolvimento", image: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=200&h=200&fit=crop", muscles: "Ombros, Tríceps" },
  { id: 6, name: "Rosca Direta", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop", muscles: "Bíceps" },
];

const Treinos = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<typeof equipments[0] | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-16 px-4 max-w-md mx-auto space-y-6">
        {/* Quick Actions */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-3 gap-3">
            {workoutCards.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className={`${color} rounded-2xl p-4 flex flex-col items-center justify-center aspect-square cursor-pointer hover:scale-105 transition-transform`}
              >
                <Icon size={28} className="mb-2" />
                <span className="text-xs font-medium text-center">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Equipamentos */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Dumbbell className="text-primary" size={20} />
            EQUIPAMENTOS
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {equipments.map((equipment) => (
              <div
                key={equipment.id}
                onClick={() => setSelectedEquipment(equipment)}
                className="bg-card rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <div className="aspect-square bg-secondary">
                  <img 
                    src={equipment.image} 
                    alt={equipment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm">{equipment.name}</h3>
                  <p className="text-xs text-muted-foreground">{equipment.muscles}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
      
      <EquipmentModal 
        equipment={selectedEquipment}
        open={!!selectedEquipment}
        onOpenChange={(open) => !open && setSelectedEquipment(null)}
      />
    </div>
  );
};

export default Treinos;
