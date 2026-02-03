import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsModal = ({ open, onOpenChange }: TermsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md mx-4 rounded-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <FileText className="text-primary" size={24} />
            Termos de Uso
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-bold text-foreground mb-2">1. Aceitação dos Termos</h3>
              <p>
                Ao utilizar o aplicativo WEMOVELT, você concorda com estes Termos de Uso. 
                Se não concordar com qualquer parte destes termos, não utilize o aplicativo.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">2. Descrição do Serviço</h3>
              <p>
                O WEMOVELT é uma plataforma de acompanhamento de treinos em academias ao ar livre, 
                oferecendo funcionalidades de check-in, registro de exercícios, acompanhamento de 
                hábitos e interação social entre usuários.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">3. Cadastro e Conta</h3>
              <p>
                Para utilizar o WEMOVELT, você deve criar uma conta fornecendo informações 
                verdadeiras e atualizadas. Você é responsável por manter a confidencialidade 
                de suas credenciais de acesso.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">4. Uso Adequado</h3>
              <p>Você concorda em:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Não publicar conteúdo ofensivo, ilegal ou que viole direitos de terceiros</li>
                <li>Não utilizar o serviço para fins fraudulentos</li>
                <li>Não tentar acessar contas de outros usuários</li>
                <li>Respeitar outros usuários da comunidade</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">5. Conteúdo do Usuário</h3>
              <p>
                Você mantém a propriedade do conteúdo que publica. Ao publicar, você concede 
                ao WEMOVELT uma licença para exibir e distribuir esse conteúdo dentro da plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">6. Saúde e Segurança</h3>
              <p>
                O WEMOVELT não substitui orientação médica ou profissional de educação física. 
                Consulte um profissional antes de iniciar qualquer programa de exercícios. 
                O uso do aplicativo é por sua conta e risco.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">7. Modificações</h3>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                Alterações significativas serão comunicadas através do aplicativo.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">8. Contato</h3>
              <p>
                Para dúvidas sobre estes termos, entre em contato através do suporte no aplicativo.
              </p>
            </section>

            <p className="text-xs text-muted-foreground/70 pt-4">
              Última atualização: Fevereiro de 2026
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
