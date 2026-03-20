import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputClassName =
    "h-12 rounded-[1rem] border-white/8 bg-black/50 px-4 text-base text-foreground placeholder:text-muted-foreground/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 md:text-sm";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password.length < 6) {
      setErrorMessage("Use pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas nao conferem.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    toast({
      title: "Senha atualizada",
      description: "Voce ja pode continuar no app com a nova senha.",
    });
    navigate("/home", { replace: true });
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="app-panel w-full max-w-sm overflow-hidden rounded-[2.2rem] border-white/10 bg-[#060606] p-0">
        <div className="relative px-6 pb-6 pt-10">
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(255,102,0,0.3),rgba(255,102,0,0.04)_58%,transparent)]" />

          <div className="relative z-10">
            <p className="app-kicker">Recuperacao</p>
            <h1 className="mt-2 text-[2rem] font-bold leading-[1.02] tracking-[-0.07em]">Defina sua nova senha</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Atualize a senha para voltar ao app com acesso completo.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nova senha"
                    className={`${inputClassName} pl-11 pr-11`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirmar nova senha"
                    className={`${inputClassName} pl-11 pr-11`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

              <Button type="submit" className="h-[3.25rem] w-full rounded-full text-base font-semibold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Salvar nova senha"}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="font-semibold text-primary hover:text-primary/80">
                Voltar ao inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
