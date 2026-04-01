import { lazy, Suspense, useState } from "react";
import { ArrowRight, Check, Flame, MapPin, Plus, Target, Trophy } from "lucide-react";
import Header from "@/components/layout/Header";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useGoals } from "@/hooks/useGoals";
import GoalProgressCard from "@/components/GoalProgressCard";
import ProgressChart from "@/components/ProgressChart";

const CheckInModal = lazy(() => import("@/components/modals/CheckInModal"));
const GoalModal = lazy(() => import("@/components/modals/GoalModal"));

const Frequencia = () => {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  const { weekData, streak, weeklyPercentage } = useCheckIn();
  const { goalsWithProgress, isLoading: goalsLoading, deleteGoal } = useGoals();

  const chartData = weekData.map(({ day, checked }) => ({
    day,
    value: checked === true ? 1 : 0,
    completed: checked === true,
  }));

  const stats = [
    { icon: Flame, label: "Sequencia", value: `${streak} ${streak === 1 ? "dia" : "dias"}` },
    { icon: Trophy, label: "Metas ativas", value: String(goalsWithProgress.length) },
  ];

  return (
    <div className="app-shell" style={{ paddingBottom: "calc(8.5rem + env(safe-area-inset-bottom))" }}>
      <Header />

      <main className="app-screen space-y-5 pt-[calc(6.75rem+env(safe-area-inset-top))]">
        <section className="animate-fade-in">
          <div className="mb-4">
            <p className="app-kicker">Frequencia</p>
            <h1 className="mt-1 text-[2rem] font-bold tracking-[-0.07em]">Consistencia visivel.</h1>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="app-panel rounded-[1.6rem] p-4">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold tracking-[-0.06em]">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="animate-slide-up" style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="app-kicker">Semana</p>
              <h2 className="app-section-title mt-1">Registros</h2>
            </div>
            <div className="rounded-full bg-primary/12 px-3 py-1 text-sm font-bold text-primary">{weeklyPercentage}%</div>
          </div>

          <div className="app-panel rounded-[1.8rem] p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              {weekData.map(({ day, date, checked }) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">{day}</span>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold ${
                      checked === true ? "orange-glow wemovelt-gradient text-primary-foreground" : "bg-white/[0.04] text-muted-foreground"
                    }`}
                  >
                    {checked === true ? <Check size={18} /> : date}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => setCheckInOpen(true)} className="h-12 justify-between rounded-[1.2rem] px-4">
                <span className="flex items-center gap-2">
                  <MapPin size={18} />
                  Registrar presenca
                </span>
                <ArrowRight size={16} />
              </Button>
              <Button onClick={() => setGoalOpen(true)} variant="secondary" className="h-12 justify-between rounded-[1.2rem] px-4">
                <span className="flex items-center gap-2">
                  <Target size={18} />
                  Nova meta
                </span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: "0.05s", contentVisibility: "auto", containIntrinsicSize: "220px" }}>
          <div className="mb-4">
            <p className="app-kicker">Analise</p>
            <h2 className="app-section-title mt-1">Progresso de treino</h2>
          </div>
          <div className="app-panel rounded-[1.8rem] p-4">
            <ProgressChart data={chartData} height={100} />
          </div>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: "0.1s", contentVisibility: "auto", containIntrinsicSize: "420px" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="app-kicker">Metas</p>
              <h2 className="app-section-title mt-1">Objetivos ativos</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setGoalOpen(true)} className="text-primary">
              <Plus size={16} className="mr-1" />
              Adicionar
            </Button>
          </div>

          {goalsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="app-panel rounded-[1.6rem] p-4 animate-pulse">
                  <div className="mb-3 h-4 w-2/3 rounded bg-white/[0.06]" />
                  <div className="h-2 rounded bg-white/[0.05]" />
                </div>
              ))}
            </div>
          ) : goalsWithProgress.length === 0 ? (
            <div className="app-panel rounded-[1.8rem] p-6 text-center">
              <Target className="mx-auto mb-3 text-muted-foreground" size={40} />
              <p className="text-sm text-muted-foreground">Voce ainda nao tem metas definidas.</p>
              <Button onClick={() => setGoalOpen(true)} variant="outline" className="mt-4">
                Criar primeira meta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {goalsWithProgress.map((goal) => (
                <GoalProgressCard key={goal.id} goal={goal} onDelete={deleteGoal} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
      <WhatsAppFAB />

      <Suspense fallback={null}>
        {checkInOpen && <CheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />}
        {goalOpen && <GoalModal open={goalOpen} onOpenChange={setGoalOpen} />}
      </Suspense>
    </div>
  );
};

export default Frequencia;
