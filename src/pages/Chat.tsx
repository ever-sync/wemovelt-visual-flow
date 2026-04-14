import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import logger from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
};

const DEFAULT_CHAT_WEBHOOK_URL =
  "https://temp-n8n-n8n-start.ecfojw.easypanel.host/webhook/61f4e12e-a7e7-43c4-843c-f2bddba4e58c/chat";
const CHAT_WEBHOOK_URL = (import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL as string | undefined) ?? DEFAULT_CHAT_WEBHOOK_URL;
const CHAT_WELCOME = "Olá! Bem-vindo à wemovelt! 💪\nSou seu personal trainer de academia ao ar livre. Vamos montar seu treino?";

const createMessage = (role: ChatRole, text: string): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  text,
  createdAt: new Date().toISOString(),
});

const getStorageKey = (userId: string) => `wemovelt-native-chat:${userId}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseBotText = (payload: unknown): string => {
  if (typeof payload === "string") return payload;

  if (Array.isArray(payload)) {
    const collected = payload.map((item) => parseBotText(item)).filter(Boolean);
    return collected.join("\n").trim();
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const direct = [record.output, record.response, record.answer, record.message, record.text, record.reply]
      .map((item) => parseBotText(item))
      .find((value) => value.length > 0);

    if (direct) return direct;

    const nested = [record.data, record.result, record.content]
      .map((item) => parseBotText(item))
      .find((value) => value.length > 0);

    if (nested) return nested;
  }

  return "";
};

const sendWebhookWithRetry = async (payload: Record<string, unknown>, maxAttempts = 3): Promise<unknown> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook retornou ${response.status}`);
      }

      return response.json().catch(() => null);
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await sleep(400 * 2 ** (attempt - 1));
      }
    }
  }

  throw lastError;
};

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const storageKey = useMemo(() => (user?.id ? getStorageKey(user.id) : null), [user?.id]);

  const persistMessage = async (message: ChatMessage) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("chat_messages" as never).insert(
        {
          id: message.id,
          user_id: user.id,
          role: message.role,
          content: message.text,
          session_id: user.id,
          metadata: { source: "app", userId: user.id },
          created_at: message.createdAt,
        } as never,
      );

      if (error) throw error;
    } catch (error) {
      logger.warn("Falha ao salvar mensagem no Supabase:", error);
    }
  };

  useEffect(() => {
    if (!storageKey || !user) return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        setMessages(parsed);
      } else {
        setMessages([createMessage("assistant", CHAT_WELCOME)]);
      }
    } catch (error) {
      logger.warn("Falha ao carregar histórico local do chat:", error);
      setMessages([createMessage("assistant", CHAT_WELCOME)]);
    }

    const loadRemoteHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages" as never)
          .select("id, role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(200);

        if (error) throw error;

        const remoteMessages = ((data as Array<Record<string, unknown>> | null) ?? [])
          .map((item) => {
            const roleRaw = String(item.role ?? "assistant");
            const role: ChatRole = roleRaw === "user" ? "user" : "assistant";
            return {
              id: String(item.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
              role,
              text: String(item.content ?? ""),
              createdAt: String(item.created_at ?? new Date().toISOString()),
            } as ChatMessage;
          })
          .filter((item) => item.text.trim().length > 0);

        if (remoteMessages.length > 0) {
          setMessages(remoteMessages);
        }
      } catch (error) {
        logger.warn("Falha ao carregar histórico remoto do chat:", error);
      }
    };

    void loadRemoteHistory();
  }, [storageKey, user]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, isAssistantTyping]);

  const appendMessage = (message: ChatMessage, saveRemote = true) => {
    setMessages((prev) => [...prev, message]);
    if (saveRemote) {
      void persistMessage(message);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !user || isSending) return;

    const userMessage = createMessage("user", text);
    appendMessage(userMessage, true);

    setInput("");
    setIsSending(true);
    setIsAssistantTyping(true);

    try {
      localStorage.setItem("sessionId", user.id);

      const rawPayload = await sendWebhookWithRetry(
        {
          message: text,
          sessionId: user.id,
          chatSessionKey: "sessionId",
          loadPreviousSession: true,
          metadata: {
            source: "app",
            userId: user.id,
          },
        },
        3,
      );

      const botText = parseBotText(rawPayload) || "Recebi sua mensagem. Vamos continuar seu treino!";
      appendMessage(createMessage("assistant", botText), true);
    } catch (error) {
      logger.error("Falha no envio do chat nativo após retries:", error);
      appendMessage(createMessage("assistant", "Não consegui responder agora. Tenta novamente em alguns segundos."), true);
    } finally {
      setIsAssistantTyping(false);
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="app-shell min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
      <button
        onClick={() => navigate(-1)}
        className="fixed left-4 top-[calc(1rem+env(safe-area-inset-top))] z-[70] flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl"
        aria-label="Voltar"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <main className="app-screen pt-[calc(5.6rem+env(safe-area-inset-top))]">
        <section className="mb-4">
          <p className="app-kicker">Chat ao vivo</p>
          <h1 className="mt-1 text-[1.85rem] font-bold tracking-[-0.06em]">Converse com o personal</h1>
        </section>

        <section className="app-panel h-[calc(100vh-15.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] rounded-[1.6rem] p-4">
          <div className="flex h-full flex-col gap-3 overflow-hidden">
            <div className="scrollbar-hide flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "wemovelt-gradient text-primary-foreground"
                        : "border border-white/8 bg-white/[0.04] text-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isAssistantTyping ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Personal está digitando...
                  </div>
                </div>
              ) : null}

              <div ref={endRef} />
            </div>
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[65] pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="app-screen pointer-events-auto">
          <div className="app-panel flex items-end gap-2 rounded-[1.4rem] p-3">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={2}
              className="min-h-[52px] resize-none rounded-xl border-white/10 bg-white/[0.03]"
            />
            <Button
              onClick={() => void handleSend()}
              disabled={isSending || input.trim().length === 0}
              className="h-11 w-11 rounded-xl p-0"
              aria-label="Enviar mensagem"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
