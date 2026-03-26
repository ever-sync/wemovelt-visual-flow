import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Bell, ChevronRight, FileText, Globe, Loader2, Settings, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isSupported,
    isEnabled,
    isLoading,
    permission,
    error,
    enablePushNotifications,
    disablePushNotifications,
  } = usePushNotifications();

  const openLegalPage = (path: "/termos" | "/privacidade" | "/exclusao-conta") => {
    onOpenChange(false);
    navigate(path);
  };

  const handlePushToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await enablePushNotifications();
        toast({
          title: "Notificacoes ativadas",
          description: "Voce vai receber alertas deste dispositivo.",
          duration: 2500,
        });
        return;
      }

      await disablePushNotifications();
      toast({
        title: "Notificacoes desativadas",
        description: "Este dispositivo nao recebera mais push.",
        duration: 2500,
      });
    } catch (toggleError) {
      toast({
        title: "Nao foi possivel atualizar",
        description:
          toggleError instanceof Error ? toggleError.message : "Verifique a permissao do navegador e tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const pushStatusText = (() => {
    if (!user) {
      return "Entre na conta para salvar este dispositivo.";
    }

    if (!isSupported) {
      return "Disponivel no app instalado via PWA.";
    }

    if (isLoading) {
      return "Verificando suporte deste dispositivo.";
    }

    if (permission === "denied") {
      return "Permissao negada no navegador. Reative nas configuracoes.";
    }

    if (isEnabled) {
      return "Curtidas, comentarios e avisos chegaro aqui mesmo com o app fechado.";
    }

    return "Ative para receber alertas deste dispositivo.";
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-panel max-w-sm rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-xl font-bold">
            <Settings className="text-primary" size={20} />
            Configuracoes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <section className="app-panel-soft rounded-[1.5rem] p-4">
            <div className="mb-4 flex items-center gap-3 text-primary">
              <Bell size={18} />
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">Notificacoes</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Push no dispositivo</p>
                  <div className="mt-1 flex items-center gap-2">
                    {isLoading && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
                    <p className="text-xs text-muted-foreground">{pushStatusText}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => void handlePushToggle(checked)}
                  disabled={!user || !isSupported || isLoading}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <p className="text-xs text-muted-foreground">Reservado para releases futuras.</p>
                </div>
                <Switch checked={false} disabled />
              </div>
            </div>
          </section>

          <section className="app-panel-soft rounded-[1.5rem] p-4">
            <div className="mb-4 flex items-center gap-3 text-primary">
              <Globe size={18} />
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">Idioma</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3">
              <span className="text-sm">Portugues (Brasil)</span>
              <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">Ativo</span>
            </div>
          </section>

          <section className="app-panel-soft rounded-[1.5rem] p-4">
            <div className="mb-4 flex items-center gap-3 text-primary">
              <Shield size={18} />
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">Privacidade</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Os documentos legais agora abrem como paginas dedicadas para evitar modal dentro de modal.
            </p>
          </section>

          <section className="app-panel-soft rounded-[1.5rem] p-4">
            <div className="mb-4 flex items-center gap-3 text-primary">
              <FileText size={18} />
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">Documentos</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => openLegalPage("/termos")}
                className="flex w-full items-center justify-between rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
              >
                <span className="text-sm font-medium">Termos de uso</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => openLegalPage("/privacidade")}
                className="flex w-full items-center justify-between rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
              >
                <span className="text-sm font-medium">Politica de privacidade</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => openLegalPage("/exclusao-conta")}
                className="flex w-full items-center justify-between rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
              >
                <span className="text-sm font-medium">Exclusao de conta</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
