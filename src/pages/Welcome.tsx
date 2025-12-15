import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AuthModal from "@/components/modals/AuthModal";

const Welcome = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    navigate("/home");
  };

  return (
    <div className="min-h-screen wemovelt-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-foreground rounded-full" />
        <div className="absolute bottom-40 right-5 w-24 h-24 border-2 border-foreground rounded-full" />
        <div className="absolute top-1/3 right-10 w-16 h-16 border-2 border-foreground rounded-full" />
      </div>

      {/* Content */}
      <div className="animate-fade-in flex flex-col items-center text-center z-10">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-foreground tracking-tight">
            WE<span className="text-foreground/90">MOVELT</span>
          </h1>
          <div className="h-1 w-20 bg-foreground/50 mx-auto mt-2 rounded-full" />
        </div>

        {/* Tagline */}
        <p className="text-xl text-foreground/90 font-medium mb-4 animate-slide-up">
          Liberdade para treinar,
        </p>
        <p className="text-xl text-foreground/90 font-medium mb-12 animate-slide-up">
          força para viver
        </p>

        {/* Decorative icon */}
        <div className="mb-12 animate-bounce-in">
          <div className="w-20 h-20 rounded-full bg-foreground/20 flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-10 h-10 text-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 4v6a6 6 0 0 0 12 0V4" />
              <line x1="4" y1="12" x2="4" y2="20" />
              <line x1="20" y1="12" x2="20" y2="20" />
              <line x1="4" y1="20" x2="10" y2="20" />
              <line x1="14" y1="20" x2="20" y2="20" />
            </svg>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 w-full max-w-xs animate-slide-up">
          <Button
            onClick={() => handleAuth("login")}
            className="w-full h-14 text-lg font-bold bg-foreground text-wemovelt-orange hover:bg-foreground/90 rounded-2xl shadow-lg"
          >
            LOGIN
          </Button>
          
          <Button
            onClick={() => handleAuth("register")}
            variant="outline"
            className="w-full h-14 text-lg font-bold bg-transparent border-2 border-foreground text-foreground hover:bg-foreground/10 rounded-2xl"
          >
            CADASTRE-SE
          </Button>
        </div>
      </div>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Welcome;
