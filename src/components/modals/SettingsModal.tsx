import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Shield, Globe, FileText, ChevronRight } from "lucide-react";
import { useState } from "react";
import TermsModal from "./TermsModal";
import PrivacyModal from "./PrivacyModal";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <Settings className="text-primary" size={24} />
              Configurações
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Notificações */}
            <div className="bg-secondary rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Bell size={20} />
                <span className="font-bold">Notificações</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm">Notificações no app</span>
                  <p className="text-xs text-muted-foreground">Receba alertas de curtidas e comentários</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm">Notificações por e-mail</span>
                  <p className="text-xs text-muted-foreground">Em breve</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} disabled />
              </div>
            </div>

            {/* Privacidade */}
            <div className="bg-secondary rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <Shield size={20} />
                <span className="font-bold">Privacidade</span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Seus dados são protegidos. Consulte nossa política de privacidade para mais informações.
              </p>
            </div>

            {/* Idioma */}
            <div className="bg-secondary rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <Globe size={20} />
                <span className="font-bold">Idioma</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Português (Brasil)</span>
                <span className="text-xs text-muted-foreground bg-primary/20 px-2 py-1 rounded-full">Ativo</span>
              </div>
            </div>

            {/* Termos */}
            <div className="bg-secondary rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <FileText size={20} />
                <span className="font-bold">Termos e Políticas</span>
              </div>
              
              <button 
                onClick={() => setTermsOpen(true)}
                className="w-full flex items-center justify-between py-2 text-sm hover:text-primary transition-colors"
              >
                <span>Termos de uso</span>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
              
              <button 
                onClick={() => setPrivacyOpen(true)}
                className="w-full flex items-center justify-between py-2 text-sm hover:text-primary transition-colors"
              >
                <span>Política de privacidade</span>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  );
};

export default SettingsModal;
