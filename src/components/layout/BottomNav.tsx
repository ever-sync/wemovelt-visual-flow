import { Home, Dumbbell, Heart, BarChart3, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Inicio", path: "/home" },
  { icon: Dumbbell, label: "Treinos", path: "/treinos" },
  { icon: Heart, label: "Habitos", path: "/habitos" },
  { icon: BarChart3, label: "Frequencia", path: "/frequencia" },
  { icon: Users, label: "Comunidade", path: "/comunidade" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 pb-[calc(0.9rem+env(safe-area-inset-bottom))]">
      <nav className="app-screen pointer-events-auto">
        <div className="app-panel mx-auto flex items-center justify-between rounded-full px-2 py-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground transition-all duration-300",
                  isActive
                    ? "wemovelt-gradient orange-glow -translate-y-3 text-primary-foreground"
                    : "hover:bg-white/[0.04] hover:text-foreground",
                )}
                aria-label={label}
                title={label}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="sr-only">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
