import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import MenuDrawer from "../modals/MenuDrawer";
import NotificationsModal from "../modals/NotificationsModal";
import { useNotifications } from "@/hooks/useNotifications";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40 border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2 touch-target hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <h1 className="text-xl font-bold wemovelt-gradient-text">WEMOVELT</h1>
          
          <button 
            onClick={() => setNotificationsOpen(true)}
            className="p-2 touch-target hover:bg-secondary rounded-lg transition-colors relative"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>
      
      <MenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
      <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  );
};

export default Header;
