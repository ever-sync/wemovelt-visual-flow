import { MessageCircle } from "lucide-react";

const WhatsAppFAB = () => {
  const handleClick = () => {
    window.open("https://wa.me/5511952130972", "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-[96px] right-4 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label="Chamar Personal no WhatsApp"
    >
      <MessageCircle size={16} />
      <span>Chamar Personal</span>
    </button>
  );
};

export default WhatsAppFAB;
