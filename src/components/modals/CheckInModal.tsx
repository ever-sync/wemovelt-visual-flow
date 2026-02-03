import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, QrCode, CheckCircle2, XCircle, Loader2, Navigation } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import QRScanner from "@/components/QRScanner";
import { parseQRCode } from "@/utils/qrValidation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useGyms } from "@/hooks/useGyms";
import { useEquipment } from "@/hooks/useEquipment";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "choose" | "qr-scanning" | "geo-checking" | "success" | "error";

interface SuccessData {
  method: "qr" | "geo";
  gymName?: string;
  equipmentName?: string;
}

const CheckInModal = ({ open, onOpenChange }: CheckInModalProps) => {
  const [step, setStep] = useState<Step>("choose");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { registerCheckIn, streak, todayCheckedIn } = useCheckIn();
  const { gyms, isLoading: gymsLoading, getGymById, getNearestGym } = useGyms();
  const { equipment, isLoading: equipmentLoading } = useEquipment();
  const geo = useGeolocation();

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep("choose");
      setSuccessData(null);
      setErrorMessage("");
      setIsSubmitting(false);
      geo.reset();
    }
  }, [open, geo]);

  // Handle geo location result
  useEffect(() => {
    if (step !== "geo-checking" || !geo.position || gymsLoading) return;

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
          "geo",
          result.gym.id,
          undefined,
          geo.position!.lat,
          geo.position!.lng
        );
        setSuccessData({
          method: "geo",
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
  }, [step, geo.position, gymsLoading, getNearestGym, registerCheckIn]);

  // Handle geo error
  useEffect(() => {
    if (step === "geo-checking" && geo.error) {
      setErrorMessage(geo.error);
      setStep("error");
    }
  }, [step, geo.error]);

  const handleQRScan = useCallback(
    async (data: string) => {
      const result = parseQRCode(data);

      if (!result.valid || !result.data) {
        setErrorMessage(result.error ?? "QR Code inválido");
        setStep("error");
        return;
      }

      // Validate gym exists
      const gym = getGymById(result.data.gymId);
      if (!gym) {
        setErrorMessage("Academia não encontrada");
        setStep("error");
        return;
      }

      // Validate equipment exists
      const equip = equipment.find(
        (e) => e.id === result.data!.equipmentId && e.gym_id === result.data!.gymId
      );
      if (!equip) {
        setErrorMessage("Equipamento não encontrado nesta academia");
        setStep("error");
        return;
      }

      try {
        setIsSubmitting(true);
        await registerCheckIn("qr", result.data.gymId, result.data.equipmentId);
        setSuccessData({
          method: "qr",
          gymName: gym.name,
          equipmentName: equip.name,
        });
        setStep("success");
      } catch (error) {
        console.error("Check-in error:", error);
        setErrorMessage("Erro ao registrar check-in. Tente novamente.");
        setStep("error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [getGymById, equipment, registerCheckIn]
  );

  const handleGeoCheckIn = () => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer check-in");
      return;
    }
    setStep("geo-checking");
    geo.requestLocation();
  };

  const handleQRStart = () => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer check-in");
      return;
    }
    setStep("qr-scanning");
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleRetry = () => {
    setStep("choose");
    setErrorMessage("");
    geo.reset();
  };

  // Get nearest gym info for error display
  const nearestGymInfo =
    geo.position && !gymsLoading ? getNearestGym(geo.position) : null;

  const isDataLoading = gymsLoading || equipmentLoading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`bg-card border-border mx-4 rounded-2xl transition-all duration-300 ${
          step === "qr-scanning" ? "max-w-md p-0" : "max-w-sm"
        }`}
      >
        {/* Step: Choose method */}
        {step === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Fazer Check-in
              </DialogTitle>
            </DialogHeader>

            {!user && (
              <div className="bg-destructive/20 text-destructive rounded-xl p-3 text-center text-sm">
                Faça login para registrar seu check-in
              </div>
            )}

            {todayCheckedIn && (
              <div className="bg-success/20 text-success rounded-xl p-3 text-center text-sm">
                ✓ Você já fez check-in hoje!
              </div>
            )}

            <p className="text-muted-foreground text-center text-sm mb-4">
              Escolha como deseja registrar sua presença
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleQRStart}
                disabled={isDataLoading || !user}
                className="w-full h-16 bg-secondary hover:bg-secondary/80 rounded-xl flex items-center justify-start px-4 gap-4"
              >
                <div className="w-12 h-12 wemovelt-gradient rounded-lg flex items-center justify-center">
                  <QrCode size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Escanear QR Code</p>
                  <p className="text-xs text-muted-foreground">No equipamento</p>
                </div>
              </Button>

              <Button
                onClick={handleGeoCheckIn}
                disabled={isDataLoading || !user}
                className="w-full h-16 bg-secondary hover:bg-secondary/80 rounded-xl flex items-center justify-start px-4 gap-4"
              >
                <div className="w-12 h-12 wemovelt-gradient rounded-lg flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Usar localização</p>
                  <p className="text-xs text-muted-foreground">Automático</p>
                </div>
              </Button>
            </div>
          </>
        )}

        {/* Step: QR Scanning */}
        {step === "qr-scanning" && (
          <div className="w-full aspect-square">
            <QRScanner
              onScan={handleQRScan}
              onCancel={() => setStep("choose")}
              onError={(error) => console.error("Scanner error:", error)}
            />
          </div>
        )}

        {/* Step: Geo checking */}
        {step === "geo-checking" && (
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
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && successData && (
          <div className="py-8 flex flex-col items-center animate-bounce-in">
            <div className="w-20 h-20 wemovelt-gradient rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">Check-in realizado!</h3>

            {successData.gymName && (
              <p className="text-muted-foreground text-center text-sm mb-2">
                📍 {successData.gymName}
                {successData.equipmentName && ` • ${successData.equipmentName}`}
              </p>
            )}

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
              <div className="bg-secondary rounded-xl p-4 mb-4 w-full">
                <p className="text-sm text-center">
                  <Navigation size={16} className="inline mr-1" />
                  Academia mais próxima: <strong>{nearestGymInfo.gym.name}</strong>
                  <br />
                  <span className="text-muted-foreground">
                    a {nearestGymInfo.distance}m de distância
                  </span>
                </p>
              </div>
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
