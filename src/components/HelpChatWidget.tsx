import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logger from "@/lib/logger";

const CHAT_STYLE_ID = "n8n-chat-style";
const DEFAULT_CHAT_WEBHOOK_URL =
  "https://temp-n8n-n8n-start.ecfojw.easypanel.host/webhook/61f4e12e-a7e7-43c4-843c-f2bddba4e58c/chat";
const CHAT_WEBHOOK_URL = (import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL as string | undefined) ?? DEFAULT_CHAT_WEBHOOK_URL;
const ALLOWED_PATHS = ["/home", "/treinos", "/habitos", "/frequencia", "/admin"];
const MOBILE_CHAT_BOTTOM = "calc(9rem + env(safe-area-inset-bottom))";

type ChatOptions = {
  webhookUrl: string;
  chatSessionKey?: string;
  loadPreviousSession?: boolean;
  mode?: "window" | "fullscreen";
  showWelcomeScreen: boolean;
  initialMessages: string[];
  i18n: {
    en: {
      title: string;
      subtitle: string;
      footer: string;
      getStarted: string;
      inputPlaceholder: string;
    };
  };
  metadata: {
    source: string;
    userId: string;
  };
};

type CreateChatFn = (options: ChatOptions) => void;
type ChatApi = {
  open?: () => void;
  show?: () => void;
};
type WindowWithChatApi = Window & {
  __wemoveltChatApi?: ChatApi;
};

const isAllowedPath = (pathname: string) =>
  ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const ensureChatStyle = () => {
  if (document.getElementById(CHAT_STYLE_ID)) return;

  const link = document.createElement("link");
  link.id = CHAT_STYLE_ID;
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/@n8n/chat/style.css";
  document.head.appendChild(link);
};

const removeChatDom = () => {
  document.querySelectorAll(".n8n-chat, .n8n-chat-widget, .n8n-chat-window").forEach((node) => node.remove());
};

const applyMobileChatOffset = () => {
  if (!window.matchMedia("(max-width: 768px)").matches) return;

  const floatingButtons = document.querySelectorAll<HTMLElement>(".n8n-chat-toggle, .n8n-chat__toggle, .chat-window-toggle");

  floatingButtons.forEach((button) => {
    button.style.setProperty("bottom", MOBILE_CHAT_BOTTOM, "important");
    button.style.setProperty("right", "1rem", "important");
    button.style.setProperty("z-index", "55", "important");
  });

  const fallbackButtons = Array.from(document.querySelectorAll<HTMLElement>(".n8n-chat button")).filter((button) => {
    const style = window.getComputedStyle(button);
    return style.position === "fixed" && parseFloat(style.bottom || "0") < 220;
  });

  fallbackButtons.forEach((button) => {
    button.style.setProperty("bottom", MOBILE_CHAT_BOTTOM, "important");
    button.style.setProperty("right", "1rem", "important");
    button.style.setProperty("z-index", "55", "important");
  });

  const genericFloatingChatButtons = Array.from(
    document.querySelectorAll<HTMLElement>("button, [role='button'], a"),
  ).filter((element) => {
    const style = window.getComputedStyle(element);
    if (style.position !== "fixed") return false;

    const rect = element.getBoundingClientRect();
    const right = Number.parseFloat(style.right || "999");
    const bottom = Number.parseFloat(style.bottom || "999");
    const label = (element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent || "").toLowerCase();

    if (label.includes("chamar personal")) return false;
    if (label.includes("instalar")) return false;
    if (label.includes("sair")) return false;

    const looksLikeFab = rect.width >= 44 && rect.width <= 96 && rect.height >= 44 && rect.height <= 96;
    const nearBottomRight = right <= 28 && bottom <= 220;

    return looksLikeFab && nearBottomRight;
  });

  genericFloatingChatButtons.forEach((button) => {
    button.style.setProperty("bottom", MOBILE_CHAT_BOTTOM, "important");
    button.style.setProperty("right", "1rem", "important");
    button.style.setProperty("z-index", "55", "important");
  });
};

const hideChatFloatingToggle = () => {
  const toggles = document.querySelectorAll<HTMLElement>(
    ".n8n-chat-toggle, .n8n-chat__toggle, .chat-window-toggle, .n8n-chat [aria-label*='chat'], .n8n-chat [title*='chat']",
  );

  toggles.forEach((toggle) => {
    toggle.style.setProperty("display", "none", "important");
    toggle.style.setProperty("visibility", "hidden", "important");
    toggle.style.setProperty("pointer-events", "none", "important");
  });
};

const openLiveChat = () => {
  const windowWithApi = window as WindowWithChatApi;
  const api = windowWithApi.__wemoveltChatApi;

  if (typeof api?.open === "function") {
    api.open();
    return;
  }

  if (typeof api?.show === "function") {
    api.show();
    return;
  }

  const selectors = [
    ".n8n-chat-toggle",
    ".n8n-chat__toggle",
    ".chat-window-toggle",
    "button[aria-label*='chat']",
    "button[aria-label*='Chat']",
    "button[title*='chat']",
    "button[title*='Chat']",
  ];

  for (const selector of selectors) {
    const button = document.querySelector<HTMLButtonElement>(selector);
    if (button) {
      button.click();
      return;
    }
  }

  const fallbackButton = Array.from(document.querySelectorAll<HTMLButtonElement>(".n8n-chat button")).find(
    (button) => button.className.includes("toggle"),
  );

  fallbackButton?.click();
};

const HelpChatWidget = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user || !isAllowedPath(location.pathname)) {
      removeChatDom();
      return;
    }

    if (!CHAT_WEBHOOK_URL) {
      logger.warn("Chat nao iniciado: VITE_N8N_CHAT_WEBHOOK_URL nao configurada.");
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;

    ensureChatStyle();

    void import("https://cdn.jsdelivr.net/npm/@n8n/chat/chat.bundle.es.js")
      .then((module) => {
        if (cancelled) return;

        const createChat = (module as { createChat?: CreateChatFn }).createChat;

        if (!createChat) {
          logger.warn("Chat nao iniciado: createChat indisponivel no bundle da CDN.");
          return;
        }

        removeChatDom();
        localStorage.setItem("sessionId", user.id);
        const chatApi = createChat({
          webhookUrl: CHAT_WEBHOOK_URL,
          chatSessionKey: "sessionId",
          loadPreviousSession: true,
          mode: "window",
          showWelcomeScreen: false,
          initialMessages: [
            "Olá! Bem-vindo à wemovelt! :muscle:\nSou seu personal trainer de academia ao ar livre. Vamos montar seu treino?",
          ],
          i18n: {
            en: {
              title: "wemovelt :herb:",
              subtitle: "Seu personal trainer ao ar livre",
              footer: "",
              getStarted: "Começar treino",
              inputPlaceholder: "Digite sua mensagem...",
            },
          },
          metadata: {
            source: "app",
            userId: user.id,
          },
        });

        applyMobileChatOffset();
        hideChatFloatingToggle();
        window.setTimeout(applyMobileChatOffset, 200);
        window.setTimeout(() => {
          hideChatFloatingToggle();
        }, 220);

        observer = new MutationObserver(() => {
          applyMobileChatOffset();
          hideChatFloatingToggle();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        (window as WindowWithChatApi).__wemoveltChatApi = (chatApi as ChatApi) ?? undefined;
      })
      .catch((error: unknown) => {
        logger.error("Falha ao carregar chat de ajuda:", error);
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [loading, user, location.pathname]);

  useEffect(() => {
    const handleOpenChat = () => {
      openLiveChat();
    };

    window.addEventListener("wemovelt:open-live-chat", handleOpenChat);

    return () => {
      window.removeEventListener("wemovelt:open-live-chat", handleOpenChat);
    };
  }, []);

  return null;
};

export default HelpChatWidget;
