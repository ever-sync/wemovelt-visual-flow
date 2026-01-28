import { useState, useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, CameraOff, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  onCancel: () => void;
  className?: string;
}

const QRScanner = ({ onScan, onError, onCancel, className }: QRScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const handleScan = useCallback(
    (result: { rawValue: string }[]) => {
      if (result && result.length > 0 && result[0].rawValue) {
        onScan(result[0].rawValue);
      }
    },
    [onScan]
  );

  const handleError = useCallback(
    (error: unknown) => {
      console.error("QR Scanner error:", error);
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setCameraError("Permissão de câmera negada");
          setHasPermission(false);
        } else if (error.name === "NotFoundError") {
          setCameraError("Nenhuma câmera encontrada");
        } else {
          setCameraError("Erro ao acessar câmera");
        }
        onError?.(error);
      }
    },
    [onError]
  );

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className={cn("relative w-full h-full min-h-[300px] bg-black rounded-xl overflow-hidden", className)}>
      {/* Camera View */}
      {!cameraError && (
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{
            facingMode,
          }}
          styles={{
            container: {
              width: "100%",
              height: "100%",
            },
            video: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
            },
          }}
          scanDelay={300}
        />
      )}

      {/* Scanning Overlay */}
      {!cameraError && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Dark overlay with cutout */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Scan area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-56 h-56">
              {/* Clear center */}
              <div className="absolute inset-0 bg-transparent" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }} />
              
              {/* Animated corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg animate-pulse" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg animate-pulse" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg animate-pulse" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg animate-pulse" />
              
              {/* Scanning line animation */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-24 inset-x-0 text-center">
            <p className="text-white text-sm font-medium px-4">
              Aponte para o QR Code do equipamento
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <CameraOff className="text-destructive" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">{cameraError}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {hasPermission === false
              ? "Habilite o acesso à câmera nas configurações do navegador"
              : "Verifique se sua câmera está funcionando"}
          </p>
          <Button
            onClick={() => {
              setCameraError(null);
              setHasPermission(null);
            }}
            className="wemovelt-gradient"
          >
            <RotateCcw size={18} className="mr-2" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleCamera}
          className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full"
        >
          <Camera size={20} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onCancel}
          className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default QRScanner;
