import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Check, Download, HelpCircle, MessageCircle, QrCode, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqs = [
  {
    question: "Como registrar presenca?",
    answer:
      "Voce pode validar sua presenca por GPS, quando estiver dentro do raio da academia, ou por QR Code em equipamentos cadastrados.",
  },
  {
    question: "O QR Code funciona de verdade?",
    answer:
      "Sim. O app agora valida o codigo pelo backend. Se o equipamento estiver vinculado a uma academia, o registro entra com integridade no Supabase.",
  },
  {
    question: "Posso montar meu proprio treino?",
    answer:
      "Sim. Na area de treinos voce pode criar sua rotina, escolher exercicios e salvar a sequencia para repetir depois.",
  },
  {
    question: "Como acompanho frequencia e metas?",
    answer:
      "Na aba Frequencia voce encontra os registros da semana, metas ativas e seu ritmo atual sem depender de consulta manual em varias telas.",
  },
];

const HelpModal = ({ open, onOpenChange }: HelpModalProps) => {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const navigate = useNavigate();

  const handleOpenLiveChat = () => {
    onOpenChange(false);
    navigate("/chat");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-panel max-w-sm rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-xl font-bold">
            <HelpCircle className="text-primary" size={20} />
            Ajuda e suporte
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="rounded-[1.55rem] border border-primary/15 bg-primary/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <QrCode size={18} />
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">Registro seguro</span>
            </div>
            <p className="text-sm leading-6 text-foreground/82">
              Validacao por GPS e QR Code agora roda com regra server-side. O cliente so dispara a tentativa.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`} className="app-panel-soft rounded-[1.35rem] border-none px-4">
                <AccordionTrigger className="py-4 text-left text-sm font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {isInstalled ? (
            <div className="app-panel-soft flex items-center justify-center gap-2 rounded-[1.35rem] p-4 text-sm">
              <Check className="text-primary" size={18} />
              App instalado no dispositivo
            </div>
          ) : canInstall ? (
            <Button onClick={() => void promptInstall()} className="w-full h-12 justify-center gap-2">
              <Download size={18} />
              Instalar no celular
            </Button>
          ) : isIOS ? (
            <div className="app-panel-soft rounded-[1.35rem] p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Smartphone size={18} />
                <span className="text-sm font-semibold">Instalar no iPhone</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Abra o menu compartilhar do Safari e toque em "Adicionar a Tela de Inicio".
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3">
            <Button onClick={handleOpenLiveChat} className="w-full justify-center gap-2">
              <MessageCircle size={18} />
              Chat ao vivo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
