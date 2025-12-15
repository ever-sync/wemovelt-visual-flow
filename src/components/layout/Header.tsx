import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import MenuDrawer from "../modals/MenuDrawer";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
          
          <button className="p-2 touch-target hover:bg-secondary rounded-lg transition-colors relative">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </header>
      
      <MenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
};

export default Header;
