import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Dumbbell, Flame, HeartPulse, MapPin, Play, Target } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import GymLocationsSection from "@/components/GymLocationsSection";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { Button } from "@/components/ui/button";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useAuth } from "@/contexts/AuthContext";
import { prefetchPrimaryRoutes } from "@/lib/prefetch";

const CheckInModal = lazy(() => import("@/components/modals/CheckInModal"));
const GoalModal = lazy(() => import("@/components/modals/GoalModal"));
const OnboardingModal = lazy(() => import("@/components/modals/OnboardingModal"));

const habitCards = [
  { label: "Hidratacao", value: "02L", tone: "bg-primary/14 text-primary" },
  { label: "Sono", value: "08h", tone: "bg-white/[0.05] text-foreground" },
  { label: "Bem-estar", value: "OK", tone: "bg-white/[0.05] text-foreground" },
];

const Home = () => {
  const navigate = useNavigate();
  const { needsOnboarding, refreshProfile } = useAuth();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { weekData } = useCheckIn();

  useEffect(() => {
    if (needsOnboarding) {
      setShowOnboarding(true);
    }
  }, [needsOnboarding]);

  useEffect(() => {
    prefetchPrimaryRoutes();
  }, []);

  const handleOnboardingComplete = async () => {
    await refreshProfile();
    setShowOnboarding(false);
  };

  const completedCount = weekData.filter(({ checked }) => checked === true).length;
  const todayEntry = weekData[weekData.length - 1];

  return (
    <div className="app-shell" style={{ paddingBottom: "calc(8.5rem + env(safe-area-inset-bottom))" }}>
      <Header />

      <main className="app-screen space-y-5 pt-[calc(6.75rem+env(safe-area-inset-top))]">
        <section className="app-panel relative overflow-hidden rounded-[2rem] px-5 pb-5 pt-6 animate-fade-in">
          <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="app-kicker">Painel principal</p>
                <h2 className="mt-2 max-w-[11ch] text-[2.05rem] font-bold leading-[0.95] tracking-[-0.07em]">
                  Treino pronto para hoje.
                </h2>
              </div>
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Foco
              </div>
            </div>

            <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
              <button
                onClick={() => navigate("/treinos")}
                className="orange-glow rounded-[1.7rem] p-[1px] text-left transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex h-full min-h-[11rem] flex-col justify-between rounded-[1.65rem] bg-[linear-gradient(180deg,rgba(255,102,0,0.18),rgba(255,102,0,0.05))] p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Play size={20} className="ml-0.5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Acesso rapido</p>
                    <h3 className="mt-2 text-xl font-bold tracking-[-0.05em]">Iniciar treino</h3>
                    <p className="mt-2 text-sm text-foreground/74">Escolha um equipamento e comece sem atrito.</p>
                  </div>
                </div>
              </button>

              <div className="space-y-3">
                <div className="app-panel-soft rounded-[1.5rem] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Semana</span>
                    <Flame size={16} className="text-primary" />
                  </div>
                  <p className="text-3xl font-bold tracking-[-0.06em]">{completedCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">registros concluidos</p>
                </div>

                <div className="app-panel-soft rounded-[1.5rem] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Hoje</span>
                    <HeartPulse size={16} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                      {todayEntry?.checked ? <Check size={18} /> : <MapPin size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{todayEntry?.checked ? "Presenca confirmada" : "Falta registrar"}</p>
                      <p className="text-xs text-muted-foreground">
                        {todayEntry?.day ?? "Hoje"} - {todayEntry?.date ?? "--"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 animate-slide-up" style={{ contentVisibility: "auto", containIntrinsicSize: "120px" }}>
          {habitCards.map(({ label, value, tone }) => (
            <button
              key={label}
              onClick={() => navigate("/habitos")}
              className="app-panel-soft flex min-h-[100px] flex-col items-start justify-between rounded-[1.4rem] p-4 text-left transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
              <div className={`inline-flex min-w-[52px] items-center justify-center rounded-full px-3 py-1 text-sm font-bold leading-none ${tone}`}>
                {value}
              </div>
            </button>
          ))}
        </section>

        <section className="animate-slide-up space-y-3" style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="app-kicker">Semana atual</p>
              <h2 className="app-section-title mt-1">Registros e metas</h2>
            </div>
            <button onClick={() => navigate("/frequencia")} className="text-sm font-semibold text-primary">
              Ver tudo
            </button>
          </div>

          <div className="app-panel rounded-[1.8rem] p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              {weekData.map(({ day, date, checked }) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">{day}</span>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold transition-all ${
                      checked === true ? "orange-glow wemovelt-gradient text-primary-foreground" : "bg-white/[0.04] text-muted-foreground"
                    }`}
                  >
                    {checked === true ? <Check size={18} /> : date}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => setCheckInOpen(true)} className="h-12 rounded-[1.2rem] px-3">
                <span className="flex min-w-0 items-center gap-2">
                  <MapPin size={18} className="shrink-0" />
                  <span className="truncate">Registrar presenca</span>
                </span>
                <ArrowRight size={16} className="ml-auto shrink-0" />
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

        <section className="animate-slide-up space-y-3" style={{ contentVisibility: "auto", containIntrinsicSize: "260px" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="app-kicker">Atalhos</p>
              <h2 className="app-section-title mt-1">Fluxos rapidos</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/treinos")}
              className="app-panel-soft rounded-[1.5rem] p-4 text-left transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                <Dumbbell size={18} />
              </div>
              <h3 className="text-base font-bold tracking-[-0.04em]">Equipamentos</h3>
              <p className="mt-1 text-sm text-muted-foreground">Entre no treino por maquina.</p>
            </button>
            <button
              onClick={() => navigate("/habitos")}
              className="app-panel-soft rounded-[1.5rem] p-4 text-left transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-foreground">
                <HeartPulse size={18} />
              </div>
              <h3 className="text-base font-bold tracking-[-0.04em]">Habitos</h3>
              <p className="mt-1 text-sm text-muted-foreground">Acompanhe agua, sono e ritmo.</p>
            </button>
          </div>
        </section>

        <GymLocationsSection />
      </main>

      <WhatsAppFAB />
      <BottomNav />

      <Suspense fallback={null}>
        {checkInOpen && <CheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />}
        {goalOpen && <GoalModal open={goalOpen} onOpenChange={setGoalOpen} />}
        {showOnboarding && <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />}
      </Suspense>
    </div>
  );
};

export default Home;
