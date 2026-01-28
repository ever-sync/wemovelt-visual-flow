import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { MapPin, Target, Check, X, Trophy, Flame } from "lucide-react";
import { useState } from "react";
import CheckInModal from "@/components/modals/CheckInModal";
import GoalModal from "@/components/modals/GoalModal";
import { useCheckIn } from "@/hooks/useCheckIn";

const goals = [
  { id: 1, label: "Treinar 4x por semana", progress: 3, total: 4, completed: false },
  { id: 2, label: "Beber 2L de água/dia", progress: 5, total: 7, completed: false },
  { id: 3, label: "Dormir 8h por noite", progress: 7, total: 7, completed: true },
];

const Frequencia = () => {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  
  const { weekData, streak, weeklyPercentage } = useCheckIn();

  const stats = [
    { icon: Flame, label: "Sequência", value: `${streak} ${streak === 1 ? "dia" : "dias"}`, color: "text-orange-400" },
    { icon: Trophy, label: "Metas cumpridas", value: "12", color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-16 px-4 max-w-md mx-auto space-y-6">
        {/* Stats */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Icon className={color} size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Calendar */}
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Esta semana</h2>
            <span className="text-primary font-bold">{weeklyPercentage}%</span>
          </div>
          
          <div className="bg-card rounded-2xl p-4">
            <div className="flex justify-between mb-4">
              {weekData.map(({ day, date, checked }) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    checked === true ? "wemovelt-gradient" :
                    checked === false ? "bg-destructive/20 text-destructive" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {checked === true ? <Check size={20} /> :
                     checked === false ? <X size={20} /> :
                     date}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setCheckInOpen(true)}
                className="flex-1 h-12 wemovelt-gradient rounded-xl font-bold"
              >
                <MapPin size={18} className="mr-2" />
                Check-in
              </Button>
              <Button 
                onClick={() => setGoalOpen(true)}
                variant="secondary"
                className="flex-1 h-12 rounded-xl font-bold"
              >
                <Target size={18} className="mr-2" />
                Nova meta
              </Button>
            </div>
          </div>
        </section>

        {/* Goals */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-bold mb-3">Minhas metas</h2>
          
          <div className="space-y-3">
            {goals.map(({ id, label, progress, total, completed }) => (
              <div key={id} className="bg-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${completed ? "line-through text-muted-foreground" : ""}`}>
                    {label}
                  </span>
                  {completed && <Check className="text-success" size={20} />}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${completed ? "bg-success" : "wemovelt-gradient"} transition-all duration-500`}
                      style={{ width: `${(progress / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{progress}/{total}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
      <CheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />
      <GoalModal open={goalOpen} onOpenChange={setGoalOpen} />
    </div>
  );
};

export default Frequencia;
