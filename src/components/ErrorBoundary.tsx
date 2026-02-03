import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import logger from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="wemovelt-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-bounce-in">
              <AlertTriangle className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Ops! Algo deu errado
              </h1>
              <p className="text-muted-foreground">
                Encontramos um problema inesperado. Tente recarregar a página ou voltar para a tela inicial.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReload}
                className="wemovelt-gradient font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Página
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="border-border"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir para Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
