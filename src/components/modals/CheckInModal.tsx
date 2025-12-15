import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, QrCode, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckInModal = ({ open, onOpenChange }: CheckInModalProps) => {
  const [step, setStep] = useState<"choose" | "scanning" | "success">("choose");

  const handleCheckIn = (method: "qr" | "geo") => {
    setStep("scanning");
    setTimeout(() => {
      setStep("success");
    }, 1500);
  };

  const handleClose = () => {
    setStep("choose");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl">
        {step === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Fazer Check-in
              </DialogTitle>
            </DialogHeader>
            
            <p className="text-muted-foreground text-center text-sm mb-6">
              Escolha como deseja registrar sua presença
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => handleCheckIn("qr")}
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
                onClick={() => handleCheckIn("geo")}
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

        {step === "scanning" && (
          <div className="py-8 flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-lg font-medium">Verificando...</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 flex flex-col items-center animate-bounce-in">
            <div className="w-20 h-20 wemovelt-gradient rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">Check-in realizado!</h3>
            <p className="text-muted-foreground text-center text-sm mb-6">
              🔥 Você treinou 3 dias seguidos!<br/>
              Continue assim, sua saúde agradece!
            </p>
            <Button 
              onClick={handleClose}
              className="wemovelt-gradient rounded-xl px-8"
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckInModal;
