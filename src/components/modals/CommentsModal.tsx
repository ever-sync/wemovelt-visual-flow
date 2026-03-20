import { useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import BrandLockup from "@/components/brand/BrandLockup";
import { useComments, Comment } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/hooks/usePosts";
import { commentSchema, validateSafe } from "@/lib/validations";
import { toast } from "sonner";

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
}

const CommentsModal = ({ open, onOpenChange, post }: CommentsModalProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading, addComment, isAddingComment, deleteComment } = useComments(post?.id || null);

  const handleSubmit = async () => {
    const result = validateSafe(commentSchema, newComment.trim());
    if (!result.success) {
      const errorResult = result as { success: false; error: string };
      toast.error(errorResult.error);
      return;
    }

    if (!user) {
      return;
    }

    try {
      await addComment({ content: newComment.trim() });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: false,
        locale: ptBR,
      });
    } catch {
      return "agora";
    }
  };

  const renderComment = (comment: Comment) => {
    const isOwner = user?.id === comment.user_id;
    const initial = comment.profiles?.name?.charAt(0).toUpperCase() || "U";
    const displayName = comment.profiles?.name || "Usuario";

    return (
      <div key={comment.id} className="flex gap-3 rounded-[1.2rem] border border-white/6 bg-white/[0.02] p-3">
        {comment.profiles?.avatar_url ? (
          <img src={comment.profiles.avatar_url} alt={displayName} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="orange-glow flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full wemovelt-gradient text-xs font-bold text-primary-foreground">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{getTimeAgo(comment.created_at)}</span>
              {isOwner && (
                <button onClick={() => void handleDelete(comment.id)} className="text-muted-foreground transition-colors hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <p className="mt-1 break-words text-sm text-foreground/88">{comment.content}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-panel mx-4 flex max-h-[80vh] max-w-sm flex-col rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <DialogHeader className="px-6 pt-6">
          <div className="rounded-[1.6rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(255,102,0,0.14),transparent_54%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <BrandLockup compact iconClassName="h-9 w-9" kickerClassName="text-[0.58rem]" titleClassName="text-sm" />
                <div>
                  <DialogTitle className="text-left text-[1.55rem] font-bold tracking-[-0.06em]">
                    Comentarios {comments.length > 0 && `(${comments.length})`}
                  </DialogTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Conversa direta sobre o post, com foco no que importa.
                  </p>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <MessageCircle size={18} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
          <div className="scrollbar-hide flex-1 space-y-3 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-3 rounded-[1.2rem] border border-white/6 bg-white/[0.02] p-3">
                  <Skeleton className="h-9 w-9 rounded-full bg-white/[0.06]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                    <Skeleton className="h-4 w-full bg-white/[0.05]" />
                  </div>
                </div>
              ))
            ) : comments.length === 0 ? (
              <div className="app-panel-soft rounded-[1.5rem] py-10 text-center">
                <p className="text-muted-foreground">Nenhum comentario ainda.</p>
                <p className="mt-1 text-sm text-muted-foreground">Seja o primeiro a entrar nessa conversa.</p>
              </div>
            ) : (
              comments.map(renderComment)
            )}
          </div>

          {user ? (
            <div className="mt-4 border-t border-white/8 pt-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escreva um comentario..."
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  className="min-h-[64px] flex-1 resize-none rounded-[1.2rem] border-white/10 bg-white/[0.03] px-4 py-3 text-base md:text-sm"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSubmit();
                    }
                  }}
                />
                <Button onClick={handleSubmit} disabled={!newComment.trim() || isAddingComment} size="icon" className="h-[64px] w-14 rounded-[1.2rem]">
                  <Send size={18} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 border-t border-white/8 pt-4 text-center">
              <p className="text-sm text-muted-foreground">Faca login para comentar.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsModal;
