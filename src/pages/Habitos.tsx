import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Heart, Droplets, Moon, Apple, Smile, TrendingUp } from "lucide-react";
import { useState } from "react";
import HabitModal from "@/components/modals/HabitModal";
import HabitTracker from "@/components/HabitTracker";
import WeeklyHabitChart from "@/components/WeeklyHabitChart";
import { useHabits } from "@/hooks/useHabits";

const categories = [
  { 
    id: "hydration",
    icon: Droplets, 
    label: "Hidratação", 
    color: "bg-blue-500/20",
    iconColor: "text-blue-400",
    description: "Beba água regularmente",
    tips: [
      "Beba pelo menos 2 litros de água por dia",
      "Tenha sempre uma garrafa de água por perto",
      "Beba um copo de água ao acordar",
      "Evite esperar sentir sede para beber"
    ]
  },
  { 
    id: "sleep",
    icon: Moon, 
    label: "Sono", 
    color: "bg-purple-500/20",
    iconColor: "text-purple-400",
    description: "Descanse bem",
    tips: [
      "Durma de 7 a 9 horas por noite",
      "Mantenha horários regulares de sono",
      "Evite telas 1 hora antes de dormir",
      "Crie um ambiente escuro e silencioso"
    ]
  },
  { 
    id: "nutrition",
    icon: Apple, 
    label: "Alimentação", 
    color: "bg-green-500/20",
    iconColor: "text-green-400",
    description: "Coma de forma equilibrada",
    tips: [
      "Faça 5 a 6 refeições por dia",
      "Inclua frutas e vegetais em todas as refeições",
      "Evite alimentos ultraprocessados",
      "Mastigue bem os alimentos"
    ]
  },
  { 
    id: "wellness",
    icon: Smile, 
    label: "Bem-estar", 
    color: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    description: "Cuide da sua mente",
    tips: [
      "Reserve tempo para atividades que você gosta",
      "Pratique respiração profunda diariamente",
      "Mantenha conexões sociais saudáveis",
      "Celebre pequenas conquistas"
    ]
  },
];

const Habitos = () => {
  const [selectedHabit, setSelectedHabit] = useState<typeof categories[0] | null>(null);
  const { weeklyStats, isLoading, isHabitCompleted } = useHabits();

  // Calculate total completed today using actual today's logs
  const totalCompletedToday = [
    "hydration", 
    "sleep", 
    "nutrition", 
    "wellness"
  ].filter(type => isHabitCompleted(type)).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-20 px-4 max-w-md mx-auto space-y-6">
        {/* Hero */}
        <section className="animate-fade-in">
          <div className="wemovelt-gradient rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Heart className="mb-3" size={32} />
            <h1 className="text-2xl font-bold mb-2">Hábitos Saudáveis</h1>
            <p className="text-foreground/80 text-sm">
              Pequenas mudanças diárias geram grandes resultados
            </p>
            
            {!isLoading && (
              <div className="mt-4 flex items-center gap-2 bg-foreground/10 rounded-xl px-4 py-2 w-fit">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">
                  {totalCompletedToday}/4 hábitos hoje
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Daily Habit Tracker */}
        <section className="animate-slide-up">
          <HabitTracker />
        </section>

        {/* Categories */}
        <section className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-lg font-bold mb-4">Categorias</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const stats = weeklyStats.find(s => s.type === category.id);
              
              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedHabit(category)}
                  className={`${category.color} rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden`}
                >
                  <Icon className={`${category.iconColor} mb-3`} size={32} />
                  <h3 className="font-bold mb-1">{category.label}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                  
                  {stats && stats.streak > 0 && (
                    <div className="absolute top-3 right-3 bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      🔥 {stats.streak}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Weekly Progress Chart */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <WeeklyHabitChart />
        </section>

        {/* Quick Tips */}
        <section className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-bold mb-4">Dica do dia</h2>
          <div className="bg-card rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 wemovelt-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                <Droplets size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Mantenha-se hidratado</h3>
                <p className="text-sm text-muted-foreground">
                  Beber água antes, durante e após o treino ajuda na recuperação muscular e melhora seu desempenho.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
      
      <HabitModal 
        habit={selectedHabit}
        open={!!selectedHabit}
        onOpenChange={(open) => !open && setSelectedHabit(null)}
      />
    </div>
  );
};

export default Habitos;