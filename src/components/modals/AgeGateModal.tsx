import { FormEvent, useState } from "react";
import { CalendarDays, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrandLockup from "@/components/brand/BrandLockup";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAdultBirthDateLimit, getMinimumBirthDate, isAdultBirthDate } from "@/lib/ageGate";

const AgeGateModal = () => {
  const { user, requiresAgeVerification, isAgeGateBlocked, verifyAdultAccess, signOut } = useAuth();
  const { toast } = useToast();
  const [birthDate, setBirthDate] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user || (!requiresAgeVerification && !isAgeGateBlocked)) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    if (!isAdultBirthDate(birthDate)) {
      setErrorMessage("O WEMOVELT e exclusivo para maiores de 18 anos.");
      return;
    }

    if (!accepted) {
      setErrorMessage("Confirme os termos para continuar.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const { allowed, error } = await verifyAdultAccess(birthDate);

      if (!allowed) {
        const message = error?.message ?? "Nao foi possivel confirmar sua idade.";
        setErrorMessage(message);
        toast({ title: "Acesso bloqueado", description: message, variant: "destructive" });

        if (message.toLowerCase().includes("maiores de 18")) {
          await signOut();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="app-panel max-w-sm overflow-hidden rounded-[2rem] border-white/10 bg-[#060606] p-0 [&>button]:hidden"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <div className="relative px-6 pb-6 pt-6">
          <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(255,102,0,0.26),rgba(255,102,0,0.04)_58%,transparent)]" />
          <div className="relative z-10 space-y-5">
            <BrandLockup compact iconClassName="h-10 w-10" kickerClassName="text-[0.58rem]" titleClassName="text-sm" />

            {isAgeGateBlocked ? (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
                    <ShieldAlert size={22} />
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-[1.35rem] font-bold tracking-[-0.04em]">
                      Acesso indisponivel
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                      Esta conta nao atende ao requisito minimo de idade para usar o WEMOVELT.
                    </DialogDescription>
                  </div>
                </div>

                <Button type="button" onClick={signOut} className="h-12 w-full rounded-full">
                  Voltar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-[1.35rem] font-bold tracking-[-0.04em]">
                      Confirmacao 18+
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                      Informe sua data de nascimento para continuar.
                    </DialogDescription>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="ageGateBirthDate"
                      type="date"
                      value={birthDate}
                      onChange={(event) => setBirthDate(event.target.value)}
                      min={getMinimumBirthDate()}
                      max={getAdultBirthDateLimit()}
                      className="h-12 rounded-[1rem] border-white/8 bg-black/50 pl-11 text-base text-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 md:text-sm"
                      disabled={saving}
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-[1.1rem] border border-white/8 bg-white/[0.04] p-3 text-xs leading-5 text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/15 bg-transparent accent-[hsl(var(--primary))]"
                    disabled={saving}
                  />
                  <span>Declaro que tenho 18 anos ou mais e aceito os Termos de Uso e a Politica de Privacidade.</span>
                </label>

                {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

                <Button type="submit" className="h-12 w-full rounded-full font-semibold" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={18} /> : "Confirmar acesso"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeGateModal;
