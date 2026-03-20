import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { prefetchAuthFlow, prefetchPrimaryRoutes } from "@/lib/prefetch";
import BrandLockup from "@/components/brand/BrandLockup";

const AuthModal = lazy(() => import("@/components/modals/AuthModal"));

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    prefetchAuthFlow();
  }, []);

  const handleAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    prefetchPrimaryRoutes();
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="app-panel flex h-20 w-20 items-center justify-center rounded-[2rem]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-[100dvh] px-2.5 py-3 sm:px-4 sm:py-6">
      <div className="app-screen">
        <section className="relative min-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[2rem] border border-white/8 bg-black sm:min-h-[calc(100dvh-3rem)] sm:rounded-[2.4rem]">
          <img
            src="/125729.jpg"
            alt="Atleta treinando com pesos"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.15)_0%,rgba(4,4,4,0.38)_28%,rgba(4,4,4,0.7)_58%,rgba(4,4,4,0.96)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,102,0,0.16),transparent_62%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(255,102,0,0.2),transparent_56%)]" />

          <div className="relative z-10 flex min-h-[calc(100dvh-1.5rem)] flex-col justify-between p-4 sm:min-h-[calc(100dvh-3rem)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur sm:px-4">
                <BrandLockup
                  compact
                  iconClassName="h-7 w-7 sm:h-8 sm:w-8"
                  kickerClassName="text-[0.58rem] sm:text-[0.62rem] text-primary/90"
                  titleClassName="text-[0.82rem] sm:text-sm tracking-[-0.04em] text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAuth("login")}
                className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[0.8rem] text-white backdrop-blur transition-colors hover:bg-black/45 sm:px-4 sm:text-sm"
              >
                Pular
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-primary" />
                <span className="h-1.5 w-2 rounded-full bg-white/70" />
                <span className="h-1.5 w-2 rounded-full bg-white/35" />
              </div>

              <div className="max-w-[18rem] space-y-2.5 sm:max-w-[16rem] sm:space-y-3">
                <p className="app-kicker text-primary">Seu ritmo comeca aqui</p>
                <h1 className="text-[clamp(2.15rem,8.8vw,3rem)] font-bold leading-[0.88] tracking-[-0.08em] text-white sm:text-[3rem] sm:leading-[0.92]">
                  Treine forte.
                  <span className="block text-primary">Viva em movimento.</span>
                </h1>
                <p className="max-w-[18rem] text-[0.95rem] leading-5 text-white/78 sm:max-w-none sm:text-sm sm:leading-6">
                  Voce ainda tem energia para mudar o dia de hoje. Entre, registre seus treinos e mantenha a constancia.
                </p>
              </div>

              <div className="rounded-[1.7rem] border border-white/10 bg-black/55 p-3 backdrop-blur-xl sm:rounded-[2rem] sm:p-4">
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-primary/90 sm:text-[0.7rem]">Comece agora</p>
                    <p className="mt-1 text-[0.88rem] text-white/70 sm:text-sm">Fluxo rapido para entrar ou criar sua conta.</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/14 text-primary sm:h-11 sm:w-11">
                    <Sparkles size={16} className="sm:h-[18px] sm:w-[18px]" />
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <Button onClick={() => handleAuth("login")} className="h-12 w-full justify-between px-4 text-sm sm:h-14 sm:px-5 sm:text-base">
                    Entrar agora
                    <ArrowRight size={16} className="sm:h-[18px] sm:w-[18px]" />
                  </Button>

                  <Button
                    onClick={() => handleAuth("register")}
                    variant="outline"
                    className="h-12 w-full border-white/12 bg-white/[0.02] text-sm text-white hover:bg-white/[0.06] sm:h-14 sm:text-base"
                  >
                    Criar conta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Suspense fallback={null}>
        {authModalOpen && (
          <AuthModal
            open={authModalOpen}
            onOpenChange={setAuthModalOpen}
            mode={authMode}
            onSuccess={handleAuthSuccess}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Welcome;
