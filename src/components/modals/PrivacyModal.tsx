import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md mx-4 rounded-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Shield className="text-primary" size={24} />
            Política de Privacidade
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-bold text-foreground mb-2">1. Coleta de Dados</h3>
              <p>Coletamos os seguintes dados:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Dados de cadastro:</strong> nome, e-mail, idade (opcional)</li>
                <li><strong>Dados de perfil:</strong> peso, altura, objetivos (opcionais)</li>
                <li><strong>Dados de localização:</strong> para check-in em academias</li>
                <li><strong>Dados de uso:</strong> treinos, hábitos, atividades</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">2. Uso dos Dados</h3>
              <p>Utilizamos seus dados para:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência de treino</li>
                <li>Validar check-ins em academias</li>
                <li>Exibir estatísticas e progressos</li>
                <li>Comunicações sobre o serviço</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">3. Localização</h3>
              <p>
                Utilizamos sua localização apenas no momento do check-in para validar 
                sua presença em uma academia cadastrada. Não rastreamos sua localização 
                continuamente. Você pode negar permissão de localização e usar check-in por QR Code.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">4. Compartilhamento</h3>
              <p>
                Não vendemos seus dados pessoais. Compartilhamos informações apenas:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Com sua autorização explícita</li>
                <li>Para cumprimento de obrigações legais</li>
                <li>Com provedores de serviço sob contratos de confidencialidade</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">5. Segurança</h3>
              <p>
                Implementamos medidas de segurança para proteger seus dados, incluindo 
                criptografia, controle de acesso e monitoramento. Porém, nenhum sistema 
                é 100% seguro.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">6. Seus Direitos (LGPD)</h3>
              <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar anonimização ou exclusão</li>
                <li>Revogar consentimento</li>
                <li>Portabilidade dos dados</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">7. Retenção de Dados</h3>
              <p>
                Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, 
                seus dados serão removidos em até 30 dias, exceto quando necessário para 
                cumprimento de obrigações legais.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">8. Cookies</h3>
              <p>
                Utilizamos cookies e tecnologias similares para manter sua sessão ativa 
                e melhorar a experiência. Você pode gerenciar cookies nas configurações 
                do seu navegador.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-foreground mb-2">9. Contato DPO</h3>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, 
                entre em contato com nosso Encarregado de Proteção de Dados através 
                do suporte no aplicativo.
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

export default PrivacyModal;
