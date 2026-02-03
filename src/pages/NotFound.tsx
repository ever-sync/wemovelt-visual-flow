import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import logger from "@/lib/logger";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="wemovelt-gradient w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-bounce-in">
          <Dumbbell className="w-12 h-12 text-primary-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold wemovelt-gradient-text">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Página não encontrada</h2>
          <p className="text-muted-foreground">
            Ops! Parece que você tentou acessar uma página que não existe. 
            Que tal voltar para os treinos?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild className="wemovelt-gradient font-bold">
            <Link to="/home">
              <Home className="w-4 h-4 mr-2" />
              Ir para Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="border-border">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
