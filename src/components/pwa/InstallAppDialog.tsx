import { Smartphone } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InstallAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InstallAppDialog = ({ open, onOpenChange }: InstallAppDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-panel max-w-sm rounded-[1.75rem] border-white/10 bg-card/95 p-0">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 px-6 pt-6 text-center text-lg font-bold">
            <Smartphone className="text-primary" size={22} />
            Instalar WEMOVELT
          </DialogTitle>
          <DialogDescription className="px-6 text-center text-sm text-muted-foreground">
            Para instalar no seu iPhone ou iPad:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 pb-6 pt-2">
          <ol className="space-y-2 rounded-[1.35rem] border border-white/6 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            <li>1. Toque no icone de compartilhar.</li>
            <li>2. Escolha "Adicionar a Tela de Inicio".</li>
            <li>3. Confirme em "Adicionar".</li>
          </ol>
          <p className="text-center text-xs text-muted-foreground">
            O app sera adicionado a sua tela inicial como um atalho nativo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallAppDialog;
