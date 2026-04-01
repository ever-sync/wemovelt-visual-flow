import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import BrandMark from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import logger from "@/lib/logger";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.warn("Erro 404: usuario tentou acessar uma rota inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-6">
      <div className="app-panel max-w-md rounded-[2rem] p-6 text-center space-y-6">
        <BrandMark className="orange-glow mx-auto h-24 w-24 rounded-[2rem] animate-bounce-in" imageClassName="h-16 w-16" />

        <div className="space-y-2">
          <h1 className="wemovelt-gradient-text text-6xl font-bold">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Pagina nao encontrada</h2>
          <p className="text-muted-foreground">
            Ops! Parece que voce tentou acessar uma pagina que nao existe. Que tal voltar para os treinos?
          </p>
        </div>

        <div className="flex flex-col gap-3 justify-center pt-4 sm:flex-row">
          <Button asChild className="font-bold">
            <Link to="/home">
              <Home className="mr-2 h-4 w-4" />
              Ir para inicio
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-border">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
