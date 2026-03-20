import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import BrandLockup from "@/components/brand/BrandLockup";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "login" | "register";
  onSuccess: () => void;
}

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(6, "Use pelo menos 6 caracteres."),
});

const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, "Nome muito curto."),
    confirmPassword: z.string().min(6, "Confirme a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas nao conferem.",
  });

const getErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();

  if (message.includes("user already registered") || message.includes("already exists")) {
    return "Este e-mail ja esta cadastrado.";
  }
  if (message.includes("invalid login credentials") || message.includes("invalid_credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (message.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (message.includes("weak password") || message.includes("password")) {
    return "Senha muito fraca. Use pelo menos 6 caracteres.";
  }
  if (message.includes("rate limit")) {
    return "Muitas tentativas. Aguarde um momento.";
  }

  return "Ocorreu um erro. Tente novamente.";
};

const AuthModal = ({ open, onOpenChange, mode, onSuccess }: AuthModalProps) => {
  const [currentMode, setCurrentMode] = useState<"login" | "register">(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [resetMode, setResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setResetMode(false);
    }
  }, [mode, open]);

  const title = useMemo(() => {
    if (resetMode) return "Recupere sua senha";
    return currentMode === "login" ? "Entre para manter seu ritmo" : "Crie sua conta e acompanhe sua evolucao";
  }, [currentMode, resetMode]);

  const subtitle = useMemo(() => {
    if (resetMode) return "Informe seu e-mail para receber o link de redefinicao.";
    return currentMode === "login"
      ? "Login rapido, interface limpa e foco total no treino."
      : "Cadastro direto para entrar no app com menos atrito.";
  }, [currentMode, resetMode]);

  const resetState = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(true);
    setResetMode(false);
    setErrors({});
  };

  const setMode = (nextMode: "login" | "register") => {
    setCurrentMode(nextMode);
    setResetMode(false);
    setErrors({});
  };

  const validateForm = () => {
    try {
      if (resetMode) {
        z.object({ email: z.string().email("Informe um e-mail valido.") }).parse({ email });
      } else if (currentMode === "login") {
        loginSchema.parse({ email, password });
      } else {
        registerSchema.parse({ name, email, password, confirmPassword });
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const nextErrors: Record<string, string> = {};
        error.errors.forEach((issue) => {
          const field = String(issue.path[0] ?? "form");
          nextErrors[field] = issue.message;
        });
        setErrors(nextErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (resetMode) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: "Erro", description: getErrorMessage(error), variant: "destructive" });
        } else {
          toast({
            title: "E-mail enviado",
            description: "Verifique sua caixa de entrada para redefinir sua senha.",
          });
          setResetMode(false);
        }
        return;
      }

      if (currentMode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Erro ao entrar", description: getErrorMessage(error), variant: "destructive" });
        } else {
          onSuccess();
        }
        return;
      }

      const { error } = await signUp(email, password, name);
      if (error) {
        toast({ title: "Erro ao cadastrar", description: getErrorMessage(error), variant: "destructive" });
      } else {
        toast({
          title: "Cadastro realizado",
          description: "Verifique seu e-mail para confirmar a conta.",
        });
        onOpenChange(false);
        resetState();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const handleSocialClick = (provider: "Google" | "Apple") => {
    toast({
      title: `${provider} em breve`,
      description: "Primeiro vamos fechar o fluxo principal com e-mail e senha.",
    });
  };

  const renderFieldError = (field: string) =>
    errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null;

  const inputClassName =
    "h-12 rounded-[1rem] border-white/8 bg-black/50 px-4 text-base text-foreground placeholder:text-muted-foreground/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 md:text-sm";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="app-panel max-w-sm overflow-hidden rounded-[2.2rem] border-white/10 bg-[#060606] p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,rgba(255,102,0,0.3),rgba(255,102,0,0.04)_58%,transparent)]" />
          <div className="absolute left-[-2rem] top-24 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-[-1rem] top-14 h-24 w-24 rounded-full bg-primary/12 blur-3xl" />

          <div className="relative z-10 px-6 pb-6 pt-10">
            <div className="mb-8">
              <BrandLockup
                className="mb-8"
                iconClassName="h-12 w-12"
                kickerClassName="text-[0.68rem]"
                titleClassName="text-lg"
              />

              <DialogTitle className="max-w-[11ch] text-[2rem] font-bold leading-[1.02] tracking-[-0.07em]">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-3 max-w-[28ch] text-sm leading-6 text-muted-foreground">
                {subtitle}
              </DialogDescription>
            </div>

            {!resetMode && (
              <div className="mb-5 grid grid-cols-2 rounded-full border border-white/8 bg-white/[0.05] p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={cn(
                    "rounded-full px-4 py-3 text-sm font-medium transition-all",
                    currentMode === "login" ? "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(255,102,0,0.26)]" : "text-muted-foreground",
                  )}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={cn(
                    "rounded-full px-4 py-3 text-sm font-medium transition-all",
                    currentMode === "register"
                      ? "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(255,102,0,0.26)]"
                      : "text-muted-foreground",
                  )}
                >
                  Sign up
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {currentMode === "register" && !resetMode && (
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Name"
                      className={`${inputClassName} pl-11`}
                      disabled={loading}
                    />
                  </div>
                  {renderFieldError("name")}
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email Address"
                    className={`${inputClassName} pl-11`}
                    disabled={loading}
                  />
                </div>
                {renderFieldError("email")}
              </div>

              {!resetMode && (
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password"
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
                  {renderFieldError("password")}
                </div>
              )}

              {currentMode === "register" && !resetMode && (
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm Password"
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
                  {renderFieldError("confirmPassword")}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1 text-xs text-muted-foreground">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-white/15 bg-transparent accent-[hsl(var(--primary))]"
                  />
                  Remember me
                </label>

                {currentMode === "login" && !resetMode ? (
                  <button type="button" onClick={() => setResetMode(true)} className="text-foreground hover:text-primary">
                    Forgot password
                  </button>
                ) : resetMode ? (
                  <button type="button" onClick={() => setResetMode(false)} className="text-foreground hover:text-primary">
                    Back to login
                  </button>
                ) : (
                  <span>Secure access</span>
                )}
              </div>

              <Button type="submit" className="h-[3.25rem] w-full rounded-full text-base font-semibold" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : resetMode ? (
                  "Enviar e-mail"
                ) : currentMode === "login" ? (
                  "Login"
                ) : (
                  "Sign up"
                )}
              </Button>

              {!resetMode && (
                <>
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[0.72rem] text-muted-foreground">Or login with</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialClick("Google")}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.06]"
                    >
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialClick("Apple")}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.06]"
                    >
                      Apple
                    </button>
                  </div>
                </>
              )}
            </form>

            {!resetMode && (
              <div className="mt-6 text-center text-xs text-muted-foreground">
                {currentMode === "login" ? "Ainda nao tem conta?" : "Ja tem conta?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(currentMode === "login" ? "register" : "login")}
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  {currentMode === "login" ? "Crie sua conta" : "Login"}
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
