import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, Target, Flame, Calendar, Trash2, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return Heart;
    case "comment":
      return MessageCircle;
    case "goal_completed":
      return Target;
    case "streak":
      return Flame;
    case "reminder":
      return Calendar;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string, read: boolean) => {
  if (read) return "bg-muted-foreground/20";
  
  switch (type) {
    case "like":
      return "bg-red-500";
    case "comment":
      return "bg-blue-500";
    case "goal_completed":
      return "bg-green-500";
    case "streak":
      return "bg-orange-500";
    case "reminder":
      return "bg-purple-500";
    default:
      return "wemovelt-gradient";
  }
};

const NotificationsModal = ({ open, onOpenChange }: NotificationsModalProps) => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    clearAll 
  } = useNotifications();

  const handleNotificationClick = async (id: string, read: boolean) => {
    if (!read) {
      await markAsRead(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Bell className="text-primary" size={24} />
            Notificações
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Action buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2 flex-shrink-0">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                className="flex-1 text-xs"
              >
                <CheckCheck size={14} className="mr-1" />
                Marcar todas como lidas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearAll()}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={14} className="mr-1" />
              Limpar
            </Button>
          </div>
        )}

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={48} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Você receberá notificações de curtidas, comentários e mais
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconBg = getNotificationColor(notification.type, notification.read);
              const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: ptBR,
              });

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                  className={cn(
                    "p-4 rounded-xl transition-colors cursor-pointer group",
                    notification.read 
                      ? "bg-secondary hover:bg-secondary/80" 
                      : "bg-primary/10 border border-primary/20 hover:bg-primary/15"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      iconBg
                    )}>
                      <Icon 
                        size={18} 
                        className={notification.read ? "text-muted-foreground" : "text-white"} 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "font-bold text-sm",
                          notification.read ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground/70 mt-2 block">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;