import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Navigation, Map } from "lucide-react";
import { useState, useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useGyms } from "@/hooks/useGyms";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "checking" | "success" | "error";

interface SuccessData {
  gymName: string;
}

const CheckInModal = ({ open, onOpenChange }: CheckInModalProps) => {
  const [step, setStep] = useState<Step>("checking");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { registerCheckIn, streak, todayCheckedIn } = useCheckIn();
  const { isLoading: gymsLoading, getNearestGym } = useGyms();
  const geo = useGeolocation();

  // Start GPS verification when modal opens
  useEffect(() => {
    if (open && user) {
      setStep("checking");
      setSuccessData(null);
      setErrorMessage("");
      setIsSubmitting(false);
      geo.reset();
      // Small delay to ensure modal is visible before requesting location
      const timer = setTimeout(() => {
        geo.requestLocation();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, user]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      geo.reset();
    }
  }, [open]);

  // Handle geo location result
  useEffect(() => {
    if (step !== "checking" || !geo.position || gymsLoading || isSubmitting) return;

    const processGeoCheckIn = async () => {
      const result = getNearestGym(geo.position!);

      if (!result) {
        setErrorMessage("Nenhuma academia encontrada");
        setStep("error");
        return;
      }

      if (!result.isWithinRadius) {
        setErrorMessage(`Você está a ${result.distance}m da academia mais próxima`);
        setStep("error");
        return;
      }

      try {
        setIsSubmitting(true);
        await registerCheckIn(
          result.gym.id,
          geo.position!.lat,
          geo.position!.lng
        );
        setSuccessData({
          gymName: result.gym.name,
        });
        setStep("success");
      } catch (error) {
        console.error("Check-in error:", error);
        setErrorMessage("Erro ao registrar check-in. Tente novamente.");
        setStep("error");
      } finally {
        setIsSubmitting(false);
      }
    };

    processGeoCheckIn();
  }, [step, geo.position, gymsLoading, getNearestGym, registerCheckIn, isSubmitting]);

  // Handle geo error
  useEffect(() => {
    if (step === "checking" && geo.error) {
      setErrorMessage(geo.error);
      setStep("error");
    }
  }, [step, geo.error]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleRetry = () => {
    setStep("checking");
    setErrorMessage("");
    setIsSubmitting(false);
    geo.reset();
    setTimeout(() => {
      geo.requestLocation();
    }, 100);
  };

  const handleNavigate = (app: "google" | "waze") => {
    if (!nearestGymInfo) return;
    const { gym } = nearestGymInfo;
    let url: string;
    if (gym.lat && gym.lng) {
      const coords = `${gym.lat},${gym.lng}`;
      url = app === "google"
        ? `https://www.google.com/maps/dir/?api=1&destination=${coords}`
        : `https://waze.com/ul?ll=${coords}&navigate=yes`;
    } else {
      const dest = encodeURIComponent(gym.address ?? gym.name);
      url = app === "google"
        ? `https://www.google.com/maps/dir/?api=1&destination=${dest}`
        : `https://waze.com/ul?q=${dest}`;
    }
    window.open(url, "_blank");
  };

  // Get nearest gym info for error/checking display
  const nearestGymInfo =
    geo.position && !gymsLoading ? getNearestGym(geo.position) : null;

  // Show login message if not authenticated
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border mx-4 rounded-2xl max-w-sm z-[200]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Fazer Check-in
          </DialogTitle>
        </DialogHeader>
        <div className="py-8 flex flex-col items-center">
          <div className="bg-destructive/20 text-destructive rounded-xl p-4 text-center text-sm mb-4">
            Faça login para registrar seu check-in
          </div>
          <Button onClick={handleClose} className="wemovelt-gradient rounded-xl px-8">
            Fechar
          </Button>
        </div>
      </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border mx-4 rounded-2xl max-w-sm z-[200]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Fazer Check-in
          </DialogTitle>
        </DialogHeader>

        {/* Already checked in today notice */}
        {todayCheckedIn && step === "checking" && (
          <div className="bg-success/20 text-success rounded-xl p-3 text-center text-sm">
            ✓ Você já fez check-in hoje!
          </div>
        )}

        {/* Step: Checking location */}
        {step === "checking" && (
          <div className="py-8 flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Loader2 size={40} className="text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-bold mb-2">
              {isSubmitting ? "Registrando check-in..." : "Verificando localização..."}
            </h3>
            <p className="text-muted-foreground text-center text-sm">
              Aguarde enquanto confirmamos sua presença na academia
            </p>
            {nearestGymInfo && !isSubmitting && (
              <div className="mt-4 bg-secondary rounded-xl px-4 py-2 text-center">
                <p className="text-sm font-semibold text-primary">📍 {nearestGymInfo.gym.name}</p>
                <p className="text-xs text-muted-foreground">{nearestGymInfo.distance}m de distância</p>
              </div>
            )}
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && successData && (
          <div className="py-8 flex flex-col items-center animate-bounce-in">
            <div className="w-20 h-20 wemovelt-gradient rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">Check-in realizado!</h3>

            <p className="text-muted-foreground text-center text-sm mb-2">
              📍 {successData.gymName}
            </p>

            <p className="text-center text-sm mb-6">
              🔥 Você está com {streak} {streak === 1 ? "dia" : "dias"} de sequência!
              <br />
              <span className="text-muted-foreground">Continue assim, sua saúde agradece!</span>
            </p>

            <Button onClick={handleClose} className="wemovelt-gradient rounded-xl px-8">
              Fechar
            </Button>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="py-8 flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
              <XCircle size={40} className="text-destructive" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ops!</h3>
            <p className="text-muted-foreground text-center text-sm mb-6">{errorMessage}</p>

            {nearestGymInfo && !nearestGymInfo.isWithinRadius && (
              <>
                <div className="bg-secondary rounded-xl p-4 mb-3 w-full">
                  <p className="text-sm text-center">
                    <Navigation size={16} className="inline mr-1" />
                    Academia mais próxima: <strong>{nearestGymInfo.gym.name}</strong>
                    <br />
                    <span className="text-muted-foreground">
                      a {nearestGymInfo.distance}m de distância
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 mb-2 w-full">
                  <Button
                    onClick={() => handleNavigate("google")}
                    variant="outline"
                    className="flex-1 rounded-xl text-xs gap-1"
                  >
                    <Map size={14} />
                    Google Maps
                  </Button>
                  <Button
                    onClick={() => handleNavigate("waze")}
                    variant="outline"
                    className="flex-1 rounded-xl text-xs gap-1"
                  >
                    🚗 Waze
                  </Button>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button onClick={handleRetry} variant="secondary" className="rounded-xl px-6">
                Tentar novamente
              </Button>
              <Button onClick={handleClose} className="wemovelt-gradient rounded-xl px-6">
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckInModal;
