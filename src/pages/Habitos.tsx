import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Heart, Droplets, Moon, Apple, Smile } from "lucide-react";
import { useState } from "react";
import HabitModal from "@/components/modals/HabitModal";

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-16 px-4 max-w-md mx-auto space-y-6">
        {/* Hero */}
        <section className="animate-fade-in">
          <div className="wemovelt-gradient rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Heart className="mb-3" size={32} />
            <h1 className="text-2xl font-bold mb-2">Hábitos Saudáveis</h1>
            <p className="text-foreground/80 text-sm">
              Pequenas mudanças diárias geram grandes resultados
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-bold mb-4">Categorias</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedHabit(category)}
                  className={`${category.color} rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-transform`}
                >
                  <Icon className={`${category.iconColor} mb-3`} size={32} />
                  <h3 className="font-bold mb-1">{category.label}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Tips */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
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
