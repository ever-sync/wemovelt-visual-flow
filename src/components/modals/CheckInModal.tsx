import { useEffect, useMemo, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, MapPin, Navigation, QrCode, TriangleAlert } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useGyms } from "@/hooks/useGyms";
import { useAuth } from "@/contexts/AuthContext";
import { openDirections } from "@/lib/native";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "select" | "locating" | "qr" | "success" | "error";

interface SuccessData {
  gymName: string;
  methodLabel: string;
}

const CheckInModal = ({ open, onOpenChange }: CheckInModalProps) => {
  const [step, setStep] = useState<Step>("select");
  const [manualQrCode, setManualQrCode] = useState("");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  const { user } = useAuth();
  const { registerGeoCheckIn, registerQrCheckIn, streak, todayCheckedIn } = useCheckIn();
  const { gyms, isLoading: gymsLoading, getNearestGym, getGymById } = useGyms();
  const geo = useGeolocation();

  useEffect(() => {
    if (!open) {
      geo.reset();
      setStep("select");
      setManualQrCode("");
      setSuccessData(null);
      setErrorMessage("");
      setIsSubmitting(false);
      setScannerError(null);
    }
  }, [geo, open]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (step !== "locating" || !geo.position || gymsLoading || isSubmitting) return;

    const nearestGym = getNearestGym(geo.position);
    if (!nearestGym) {
      setErrorMessage("Nenhuma academia cadastrada foi encontrada perto de voce.");
      setStep("error");
      return;
    }

    const runGeoCheckIn = async () => {
      if (!nearestGym.isWithinRadius) {
        setErrorMessage(`Voce esta a ${nearestGym.distance}m da academia mais proxima.`);
        setStep("error");
        return;
      }

      try {
        setIsSubmitting(true);
        const checkIn = await registerGeoCheckIn(nearestGym.gym.id, geo.position.lat, geo.position.lng);
        setSuccessData({
          gymName: getGymById(checkIn.gym_id ?? "")?.name ?? nearestGym.gym.name,
          methodLabel: "GPS validado",
        });
        setStep("success");
      } catch (error) {
      console.error("Erro ao registrar presenca por GPS:", error);
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel registrar a presenca.");
        setStep("error");
      } finally {
        setIsSubmitting(false);
      }
    };

    runGeoCheckIn();
  }, [geo.position, getGymById, getNearestGym, gymsLoading, isSubmitting, registerGeoCheckIn, step]);

  useEffect(() => {
    if (step === "locating" && geo.error) {
      setErrorMessage(geo.error);
      setStep("error");
    }
  }, [geo.error, step]);

  const nearestGymInfo = useMemo(() => {
    if (!geo.position || gymsLoading || gyms.length === 0) return null;
    return getNearestGym(geo.position);
  }, [geo.position, getNearestGym, gyms, gymsLoading]);

  const handleStartGeo = () => {
    if (todayCheckedIn || !isOnline) return;

    setStep("locating");
    setErrorMessage("");
    setSuccessData(null);
    setScannerError(null);
    geo.reset();
    window.setTimeout(() => geo.requestLocation(), 100);
  };

  const handleQrSubmit = async (qrCode: string) => {
    const normalizedQr = qrCode.trim();
    if (!normalizedQr || isSubmitting || todayCheckedIn || !isOnline) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const checkIn = await registerQrCheckIn(normalizedQr);
      setSuccessData({
        gymName: getGymById(checkIn.gym_id ?? "")?.name ?? "Academia validada",
        methodLabel: "QR Code validado",
      });
      setManualQrCode(normalizedQr);
      setStep("success");
    } catch (error) {
      console.error("Erro ao registrar presenca por QR:", error);
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel validar o QR Code.");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setErrorMessage("");
    setSuccessData(null);
    setScannerError(null);
    setManualQrCode("");
    geo.reset();
    setStep("select");
  };

  const handleNavigate = (app: "google" | "waze") => {
    if (!nearestGymInfo) return;

    const { gym } = nearestGymInfo;
    void openDirections({
      app,
      address: gym.address ?? gym.name,
      lat: gym.lat,
      lng: gym.lng,
    });
  };

  const renderTitle = () => {
    if (step === "qr") return "Registro por QR Code";
    if (step === "success") return "Registro concluido";
    if (step === "error") return "Nao foi possivel validar";
    return "Registrar presenca";
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="app-panel max-w-sm rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-center text-xl font-bold">Registrar presenca</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 pb-6">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 text-center text-sm text-muted-foreground">
              Faca login para registrar sua presenca.
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-panel max-w-sm rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-center text-xl font-bold">{renderTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          {todayCheckedIn && step === "select" && (
            <div className="rounded-[1.6rem] border border-primary/20 bg-primary/10 p-5 text-center">
              <p className="text-sm font-semibold text-primary">Presenca ja registrada hoje.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Sua sequencia atual esta em {streak} {streak === 1 ? "dia" : "dias"}.
              </p>
            </div>
          )}

          {step === "select" && !todayCheckedIn && (
            <>
              <p className="text-center text-sm text-muted-foreground">
                Escolha como deseja validar sua presenca na academia.
              </p>

              {!isOnline && (
                <div className="rounded-[1.45rem] border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-300">Sem conexao</p>
                  <p className="mt-1 text-xs text-amber-100/75">
                    Registro por GPS ou QR precisa de internet para confirmar sua presenca.
                  </p>
                </div>
              )}

              <div className="grid gap-3">
                <button
                  onClick={handleStartGeo}
                  disabled={!isOnline}
                  className="orange-glow rounded-[1.5rem] p-[1px] text-left transition-transform duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <div className="flex items-center gap-4 rounded-[1.45rem] bg-[linear-gradient(180deg,rgba(255,102,0,0.18),rgba(255,102,0,0.05))] px-4 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Navigation size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Validar por GPS</p>
                      <p className="mt-1 text-xs text-foreground/72">
                        Usa sua localizacao atual e checa o raio permitido.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStep("qr")}
                  disabled={!isOnline}
                  className="app-panel-soft flex items-center gap-4 rounded-[1.5rem] px-4 py-4 text-left transition-transform duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-primary">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Escanear QR Code</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Leia o codigo do equipamento ou digite manualmente.
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === "locating" && (
            <div className="space-y-4 py-2">
              <div className="flex justify-center">
                <div className="orange-glow flex h-20 w-20 items-center justify-center rounded-full bg-primary/14 text-primary">
                  <Loader2 size={34} className="animate-spin" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-lg font-bold">{isSubmitting ? "Registrando presenca..." : "Localizando voce..."}</p>
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto validamos sua distancia ate a academia.
                </p>
              </div>
              {nearestGymInfo && (
                <div className="app-panel-soft rounded-[1.4rem] p-4 text-center">
                  <p className="text-sm font-semibold text-foreground">{nearestGymInfo.gym.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{nearestGymInfo.distance}m de distancia</p>
                </div>
              )}
            </div>
          )}

          {step === "qr" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Posicione o QR Code dentro da moldura ou digite o codigo abaixo.
              </p>
              {!isOnline && (
                <div className="rounded-[1.45rem] border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-300">Sem conexao</p>
                  <p className="mt-1 text-xs text-amber-100/75">
                    O scanner pode abrir a camera, mas o registro nao sera enviado sem internet.
                  </p>
                </div>
              )}
              <div className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-black">
                <Scanner
                  onScan={(codes) => {
                    const rawValue = codes[0]?.rawValue;
                    if (rawValue) {
                      void handleQrSubmit(rawValue);
                    }
                  }}
                  onError={(error) => {
                    const message = error instanceof Error ? error.message : "Nao foi possivel acessar a camera.";
                    setScannerError(message);
                  }}
                  scanDelay={900}
                  allowMultiple={false}
                  paused={isSubmitting || !isOnline}
                  constraints={{ facingMode: "environment" }}
                  formats={["qr_code"]}
                  components={{ finder: true, onOff: true, torch: true }}
                  sound
                />
              </div>
              {scannerError && (
                <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-3 text-xs text-muted-foreground">
                  {scannerError}
                </div>
              )}
              <div className="space-y-2">
                <Input
                  value={manualQrCode}
                  onChange={(event) => setManualQrCode(event.target.value)}
                  placeholder="Digite o codigo do equipamento"
                  disabled={!isOnline}
                  className="h-12 rounded-[1rem] border-white/10 bg-white/[0.04]"
                />
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep("select")} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    onClick={() => void handleQrSubmit(manualQrCode)}
                    disabled={!manualQrCode.trim() || isSubmitting || !isOnline}
                    className="flex-1"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Validar"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "success" && successData && (
            <div className="space-y-4 py-2 text-center">
              <div className="flex justify-center">
                <div className="orange-glow flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 size={38} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold">Tudo certo.</p>
                <p className="text-sm text-muted-foreground">
                  {successData.methodLabel} em <span className="text-foreground">{successData.gymName}</span>.
                </p>
                <p className="text-sm text-muted-foreground">
                  Sequencia atual: {streak} {streak === 1 ? "dia" : "dias"}.
                </p>
              </div>
              <Button onClick={() => onOpenChange(false)} className="w-full">
                Fechar
              </Button>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.05] text-primary">
                  <TriangleAlert size={36} />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-lg font-bold">Nao foi possivel concluir.</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>

              {nearestGymInfo && !nearestGymInfo.isWithinRadius && (
                <div className="space-y-3 rounded-[1.45rem] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{nearestGymInfo.gym.name}</p>
                      <p className="text-xs text-muted-foreground">{nearestGymInfo.distance}m de distancia</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => handleNavigate("google")} className="flex-1">
                      Google Maps
                    </Button>
                    <Button variant="secondary" onClick={() => handleNavigate("waze")} className="flex-1">
                      Waze
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleRetry} className="flex-1">
                  Tentar novamente
                </Button>
                <Button onClick={() => onOpenChange(false)} className="flex-1">
                  Fechar
                </Button>
              </div>
            </div>
          )}

          {step === "select" && todayCheckedIn && (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Fechar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInModal;
