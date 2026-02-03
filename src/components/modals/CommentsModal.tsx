import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  const {
    comments,
    isLoading,
    addComment,
    isAddingComment,
    deleteComment,
  } = useComments(post?.id || null);

  const handleSubmit = async () => {
    // Validate comment before submitting
    const result = validateSafe(commentSchema, newComment.trim());
    if (!result.success) {
      const errorResult = result as { success: false; error: string };
      toast.error(errorResult.error);
      return;
    }

    if (!user) return;

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
    const displayName = comment.profiles?.name || "Usuário";

    return (
      <div key={comment.id} className="flex gap-3 py-3 border-b border-border last:border-0">
        {comment.profiles?.avatar_url ? (
          <img
            src={comment.profiles.avatar_url}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 wemovelt-gradient rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate">{displayName}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">{getTimeAgo(comment.created_at)}</span>
              {isOwner && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-foreground/90 mt-0.5 break-words">{comment.content}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Comentários {comments.length > 0 && `(${comments.length})`}
          </DialogTitle>
        </DialogHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {isLoading ? (
            <div className="space-y-4 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Nenhum comentário ainda.</p>
              <p className="text-sm mt-1">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {comments.map(renderComment)}
            </div>
          )}
        </div>

        {/* New comment input */}
        {user ? (
          <div className="pt-4 border-t border-border mt-auto">
            <div className="flex gap-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] bg-secondary border-border rounded-xl resize-none flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim() || isAddingComment}
                size="icon"
                className="h-[60px] w-12 wemovelt-gradient rounded-xl"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-border mt-auto text-center">
            <p className="text-sm text-muted-foreground">
              Faça login para comentar
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommentsModal;
