import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Download, Smartphone, Check } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Badge } from "@/components/ui/badge";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqs = [
  {
    question: "Como faço check-in na academia?",
    answer: "Você pode fazer check-in de duas formas: escaneando o QR Code disponível no local ou ativando a geolocalização do seu celular próximo à academia."
  },
  {
    question: "Os treinos são personalizados?",
    answer: "Sim! Ao criar seu perfil e definir seus objetivos, o app sugere treinos adequados ao seu nível e metas. Você também pode criar treinos personalizados."
  },
  {
    question: "Como usar os equipamentos públicos?",
    answer: "Na seção de Treinos, você encontra vídeos demonstrativos de cada equipamento com instruções de uso, postura correta e dicas de segurança."
  },
  {
    question: "Posso treinar sem conexão com internet?",
    answer: "Algumas funcionalidades básicas funcionam offline, mas recomendamos conexão para ter acesso completo aos vídeos e fazer check-in."
  },
  {
    question: "Como acompanho minha frequência?",
    answer: "Na aba 'Frequência', você visualiza seu histórico de treinos, dias consecutivos e metas alcançadas. Cada check-in é registrado automaticamente."
  },
  {
    question: "Posso compartilhar meus treinos?",
    answer: "Sim! Na seção Comunidade, você pode postar seus treinos, conquistas e interagir com outros usuários do WEMOVELT."
  },
];

const HelpModal = ({ open, onOpenChange }: HelpModalProps) => {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const handleWhatsAppPersonal = () => {
    window.open("https://wa.me/5511952130972?text=Olá! Gostaria de falar com um personal do WEMOVELT", "_blank");
  };

  const handleWhatsAppSupport = () => {
    window.open("https://wa.me/5511952130972?text=Olá! Preciso de ajuda com o app WEMOVELT", "_blank");
  };

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <HelpCircle className="text-primary" size={24} />
            Ajuda - FAQ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-secondary rounded-xl border-none px-4"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* PWA Install Section */}
          <div className="space-y-2">
            {isInstalled ? (
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary rounded-xl">
                <Check className="text-green-500" size={20} />
                <span className="text-sm font-medium text-muted-foreground">App instalado no seu dispositivo</span>
              </div>
            ) : canInstall ? (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors"
              >
                <Download size={24} />
                Instalar no celular
              </button>
            ) : isIOS ? (
              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Smartphone size={20} className="text-primary" />
                  Instalar no iPhone
                </div>
                <p className="text-xs text-muted-foreground">
                  Toque em <strong>Compartilhar</strong> (ícone de seta) e depois em <strong>"Adicionar à Tela de Início"</strong>
                </p>
              </div>
            ) : null}
            
            {(canInstall || isIOS) && !isInstalled && (
              <p className="text-center text-xs text-muted-foreground">
                Adicione o WEMOVELT à tela inicial do seu celular
              </p>
            )}
          </div>

          {/* WhatsApp Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleWhatsAppPersonal}
              className="w-full flex items-center justify-center gap-3 wemovelt-gradient text-white font-bold py-4 rounded-xl transition-all hover:opacity-90"
            >
              <MessageCircle size={24} />
              Chame nosso personal
            </button>

            <button
              onClick={handleWhatsAppSupport}
              className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 rounded-xl transition-colors"
            >
              <MessageCircle size={24} />
              Falar com suporte
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Dúvidas sobre o app? Quer um treino personalizado? Estamos aqui!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
