import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Play, Plus, Calendar, Dumbbell } from "lucide-react";
import { useState } from "react";
import EquipmentModal from "@/components/modals/EquipmentModal";
import MyWorkoutsModal from "@/components/modals/MyWorkoutsModal";
import DailyWorkoutModal from "@/components/modals/DailyWorkoutModal";
import CreateWorkoutModal from "@/components/modals/CreateWorkoutModal";
import { useEquipment, Equipment } from "@/hooks/useEquipment";
import { Skeleton } from "@/components/ui/skeleton";

const workoutCards = [
  { icon: Play, label: "Meus treinos", color: "wemovelt-gradient", action: "my-workouts" },
  { icon: Calendar, label: "Treino do dia", color: "bg-secondary", action: "daily-workout" },
  { icon: Plus, label: "Criar treino", color: "bg-secondary", action: "create-workout" },
];

const Treinos = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [myWorkoutsOpen, setMyWorkoutsOpen] = useState(false);
  const [dailyWorkoutOpen, setDailyWorkoutOpen] = useState(false);
  const [createWorkoutOpen, setCreateWorkoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { equipment, isLoading, categories } = useEquipment();

  const filteredEquipment = selectedCategory 
    ? equipment.filter(eq => eq.category === selectedCategory)
    : equipment;

  const handleCardClick = (action: string) => {
    if (action === "my-workouts") setMyWorkoutsOpen(true);
    if (action === "daily-workout") setDailyWorkoutOpen(true);
    if (action === "create-workout") setCreateWorkoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-[calc(5rem+env(safe-area-inset-top))] px-4 max-w-md mx-auto space-y-6">
        {/* Quick Actions */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-3 gap-3">
            {workoutCards.map(({ icon: Icon, label, color, action }) => (
              <div
                key={label}
                onClick={() => handleCardClick(action)}
                className={`${color} rounded-2xl p-4 flex flex-col items-center justify-center aspect-square cursor-pointer hover:scale-105 transition-transform`}
              >
                <Icon size={28} className="mb-2" />
                <span className="text-xs font-medium text-center">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Category Filters */}
        <section className="animate-fade-in">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedCategory ? "wemovelt-gradient" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                  selectedCategory === category ? "wemovelt-gradient" : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Equipamentos */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Dumbbell className="text-primary" size={20} />
            EQUIPAMENTOS
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell size={48} className="mx-auto mb-2 opacity-50" />
              <p>Nenhum equipamento encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredEquipment.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => setSelectedEquipment(eq)}
                  className="bg-card rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <div className="aspect-square bg-secondary">
                    {eq.image_url ? (
                      <img 
                        src={eq.image_url} 
                        alt={eq.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Dumbbell size={32} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm">{eq.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {eq.muscles?.join(", ") || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
      
      <EquipmentModal 
        equipment={selectedEquipment}
        open={!!selectedEquipment}
        onOpenChange={(open) => !open && setSelectedEquipment(null)}
      />
      <MyWorkoutsModal open={myWorkoutsOpen} onOpenChange={setMyWorkoutsOpen} />
      <DailyWorkoutModal open={dailyWorkoutOpen} onOpenChange={setDailyWorkoutOpen} />
      <CreateWorkoutModal open={createWorkoutOpen} onOpenChange={setCreateWorkoutOpen} />
    </div>
  );
};

export default Treinos;
