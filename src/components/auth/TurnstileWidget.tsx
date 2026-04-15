import { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string | null) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

const ensureTurnstileScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile-script="true"]');

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Falha ao carregar o Turnstile.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o Turnstile."));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

const TurnstileWidget = ({ siteKey, onVerify }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void ensureTurnstileScript()
      .then(() => {
        if (!isActive || !containerRef.current || !window.turnstile) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => {
            setLoadError(null);
            onVerify(token);
          },
          "expired-callback": () => onVerify(null),
          "error-callback": () => {
            onVerify(null);
            setLoadError("Nao foi possivel validar o captcha. Atualize a pagina e tente novamente.");
          },
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        onVerify(null);
        setLoadError("Nao foi possivel carregar a verificacao anti-bot.");
      });

    return () => {
      isActive = false;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [onVerify, siteKey]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {loadError ? <p className="text-xs text-destructive">{loadError}</p> : null}
    </div>
  );
};

export default TurnstileWidget;
