import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logger from "@/lib/logger";

const CHAT_STYLE_ID = "n8n-chat-style";
const CHAT_WEBHOOK_URL = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL as string | undefined;
const ALLOWED_PATHS = ["/home", "/treinos", "/habitos", "/frequencia", "/admin"];

type ChatOptions = {
  webhookUrl: string;
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
        const chatApi = createChat({
          webhookUrl: CHAT_WEBHOOK_URL,
          showWelcomeScreen: false,
          initialMessages: [
            "Ola! Bem-vindo a wemovelt! 💪\nSou seu personal trainer de academia ao ar livre. Vamos montar seu treino?",
          ],
          i18n: {
            en: {
              title: "wemovelt 🌿",
              subtitle: "Seu personal trainer ao ar livre",
              footer: "",
              getStarted: "Comecar treino",
              inputPlaceholder: "Digite sua mensagem...",
            },
          },
          metadata: {
            source: "app",
            userId: user.id,
          },
        });

        (window as WindowWithChatApi).__wemoveltChatApi = (chatApi as ChatApi) ?? undefined;
      })
      .catch((error: unknown) => {
        logger.error("Falha ao carregar chat de ajuda:", error);
      });

    return () => {
      cancelled = true;
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
