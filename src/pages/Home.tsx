import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Play, MapPin, Check, Target } from "lucide-react";
import { useState, useEffect } from "react";
import CheckInModal from "@/components/modals/CheckInModal";
import GoalModal from "@/components/modals/GoalModal";
import OnboardingModal from "@/components/modals/OnboardingModal";
import GymLocationsSection from "@/components/GymLocationsSection";
import { useNavigate } from "react-router-dom";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useAuth } from "@/contexts/AuthContext";

const habits = [
  { icon: "💧", label: "Hidratação", color: "bg-blue-500/20" },
  { icon: "😴", label: "Sono", color: "bg-purple-500/20" },
  { icon: "🥗", label: "Alimentação", color: "bg-green-500/20" },
];

const Home = () => {
  const navigate = useNavigate();
  const { needsOnboarding, refreshProfile } = useAuth();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const { weekData } = useCheckIn();

  // Show onboarding for new users
  useEffect(() => {
    if (needsOnboarding) {
      setShowOnboarding(true);
    }
  }, [needsOnboarding]);

  const handleOnboardingComplete = async () => {
    await refreshProfile();
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-[calc(5rem+env(safe-area-inset-top))] px-4 max-w-md mx-auto space-y-6">
        {/* Treinos Section */}
        <section className="animate-fade-in">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-primary">●</span> TREINOS
          </h2>
          <div 
            onClick={() => navigate("/treinos")}
            className="bg-card rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 wemovelt-gradient rounded-xl flex items-center justify-center">
                <Play size={28} className="text-foreground ml-1" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Iniciar treino</h3>
                <p className="text-muted-foreground text-sm">Escolha um equipamento</p>
              </div>
            </div>
          </div>
        </section>

        {/* Frequência Section */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-primary">●</span> FREQUÊNCIA
          </h2>
          <div className="bg-card rounded-2xl p-4">
            {/* Week days - now using real data */}
            <div className="flex justify-between mb-4">
              {weekData.map(({ day, date, checked }) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    checked === true ? "wemovelt-gradient" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {checked === true ? <Check size={16} /> : date}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
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
                Criar meta
              </Button>
            </div>
          </div>
        </section>

        {/* Meus Hábitos Section */}
        <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-primary">●</span> MEUS HÁBITOS
          </h2>
          <div 
            onClick={() => navigate("/habitos")}
            className="grid grid-cols-3 gap-3 cursor-pointer"
          >
            {habits.map(({ icon, label, color }) => (
              <div 
                key={label}
                className={`${color} rounded-2xl p-4 text-center hover:scale-105 transition-transform`}
              >
                <span className="text-3xl mb-2 block">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Localizações das Academias Section */}
        <GymLocationsSection />
      </main>

      <BottomNav />
      <CheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} />
      <GoalModal open={goalOpen} onOpenChange={setGoalOpen} />
      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  );
};

export default Home;
