import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhatsAppFAB = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/chat");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed right-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[#141414]/90 px-3.5 py-3 text-xs font-bold text-white shadow-[0_16px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 active:scale-95 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6"
      aria-label="Abrir chat ao vivo"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-[#041b0b]">
        <MessageCircle size={16} />
      </span>
      <span>Chamar Personal</span>
    </button>
  );
};

export default WhatsAppFAB;
