import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/brand/BrandMark";
import { openWhatsApp } from "@/lib/native";

const deletionSteps = [
  "Abra esta pagina no app ou no navegador.",
  "Toque em solicitar exclusao para enviar a mensagem padrao no WhatsApp.",
  "Nos responderemos confirmando a exclusao da conta e dos dados associados, conforme os prazos legais e tecnicos aplicaveis.",
];

const dataScope = [
  "Perfil, autenticacao e preferencias da conta.",
  "Treinos, habitos, metas, registros de presenca e historico de uso.",
  "Avatar, dados de perfil e historico de uso do app.",
  "Subscricoes de notificacao e dados tecnicos vinculados a conta.",
];

const ExclusaoConta = () => {
  const handleRequestDeletion = () => {
    void openWhatsApp(
      "Ola! Quero solicitar a exclusao da minha conta e dos meus dados do WEMOVELT. Por favor, confirmem o procedimento.",
    );
  };

  return (
    <div className="app-shell min-h-screen px-4 py-6">
      <div className="app-screen">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="secondary" size="icon" asChild className="h-11 w-11 rounded-full">
            <Link to="/">
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <div className="relative">
            <BrandMark className="orange-glow h-11 w-11 rounded-[1rem] border-white/10 bg-black/30" imageClassName="h-7 w-7" />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Trash2 size={10} />
            </div>
          </div>
          <div>
            <p className="app-kicker">Legal</p>
            <h1 className="text-[1.7rem] font-bold tracking-[-0.06em]">Exclusao de conta</h1>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Use esta pagina para solicitar a exclusao da sua conta WEMOVELT e dos dados associados.
              A solicitacao e feita pelo WhatsApp de suporte para que possamos confirmar sua identidade e processar o pedido com seguranca.
            </p>
          </div>

          <section className="app-panel-soft rounded-[1.45rem] p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Como solicitar</h2>
            <ol className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
              {deletionSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="app-panel-soft rounded-[1.45rem] p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Dados excluidos</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {dataScope.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-primary/80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="app-panel-soft rounded-[1.45rem] p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Prazo e contato</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A exclusao e tratada com base nos prazos tecnicos e legais aplicaveis. Se houver pendencia de seguranca, fraude ou obrigacao legal, alguns registros podem ser retidos pelo periodo exigido pela lei.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleRequestDeletion} className="flex-1 h-12 gap-2">
                <MessageCircle size={18} />
                Solicitar exclusao
              </Button>
              <Button asChild variant="secondary" className="flex-1 h-12 gap-2">
                <Link to="/privacidade">
                  <Shield size={18} />
                  Ver privacidade
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ExclusaoConta;
