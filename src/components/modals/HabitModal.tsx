import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LucideIcon } from "lucide-react";

interface Habit {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
  iconColor: string;
  description: string;
  tips: string[];
}

interface HabitModalProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HabitModal = ({ habit, open, onOpenChange }: HabitModalProps) => {
  if (!habit) return null;

  const Icon = habit.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <div className={`w-16 h-16 ${habit.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Icon className={habit.iconColor} size={32} />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {habit.label}
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            {habit.description}
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <h4 className="font-bold text-sm">Dicas práticas:</h4>
          {habit.tips.map((tip, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-secondary rounded-xl animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={18} />
              <span className="text-sm">{tip}</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={() => onOpenChange(false)}
          className="w-full h-12 wemovelt-gradient rounded-xl font-bold mt-4"
        >
          Entendi!
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default HabitModal;
