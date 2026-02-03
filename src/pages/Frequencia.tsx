import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { MapPin, Target, Check, Trophy, Flame, Plus } from "lucide-react";
import { useState } from "react";
import CheckInModal from "@/components/modals/CheckInModal";
import GoalModal from "@/components/modals/GoalModal";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useGoals } from "@/hooks/useGoals";
import GoalProgressCard from "@/components/GoalProgressCard";
import ProgressChart from "@/components/ProgressChart";
import { startOfWeek, addDays, format } from "date-fns";

const Frequencia = () => {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  
  const { weekData, streak, weeklyPercentage } = useCheckIn();
  const { goalsWithProgress, isLoading: goalsLoading, deleteGoal } = useGoals();

  // Prepare chart data from weekData
  const chartData = weekData.map(({ day, checked }) => ({
    day,
    value: checked === true ? 1 : 0,
    completed: checked === true,
  }));

  const stats = [
    { icon: Flame, label: "Sequência", value: `${streak} ${streak === 1 ? "dia" : "dias"}`, color: "text-orange-400" },
    { icon: Trophy, label: "Metas ativas", value: String(goalsWithProgress.length), color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-[calc(5rem+env(safe-area-inset-top))] px-4 max-w-md mx-auto space-y-6">
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
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {checked === true ? <Check size={20} /> : date}
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

        {/* Weekly Progress Chart */}
        <section className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-lg font-bold mb-3">Progresso de Treinos</h2>
          <div className="bg-card rounded-2xl p-4">
            <ProgressChart data={chartData} height={100} />
          </div>
        </section>

        {/* Goals */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Minhas metas</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGoalOpen(true)}
              className="text-primary"
            >
              <Plus size={16} className="mr-1" />
              Adicionar
            </Button>
          </div>
          
          {goalsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-secondary rounded w-2/3 mb-3" />
                  <div className="h-2 bg-secondary rounded" />
                </div>
              ))}
            </div>
          ) : goalsWithProgress.length === 0 ? (
            <div className="bg-card rounded-2xl p-6 text-center">
              <Target className="mx-auto text-muted-foreground mb-3" size={40} />
              <p className="text-muted-foreground text-sm">
                Você ainda não tem metas definidas.
              </p>
              <Button
                onClick={() => setGoalOpen(true)}
                variant="link"
                className="text-primary mt-2"
              >
                Criar primeira meta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {goalsWithProgress.map((goal) => (
                <GoalProgressCard 
                  key={goal.id} 
                  goal={goal} 
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
      <CheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />
      <GoalModal open={goalOpen} onOpenChange={setGoalOpen} />
    </div>
  );
};

export default Frequencia;