import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Post } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (post: Post) => void;
  onShare: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

const PostCard = ({ post, onLike, onComment, onShare, onDelete }: PostCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

  const getInitial = () => {
    return post.profiles?.name?.charAt(0).toUpperCase() || "U";
  };

  const getDisplayName = () => {
    return post.profiles?.name || "Usuário";
  };

  const getUsername = () => {
    return post.profiles?.username ? `@${post.profiles.username}` : "@usuario";
  };

  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(post.created_at), {
        addSuffix: false,
        locale: ptBR,
      });
    } catch {
      return "agora";
    }
  };

  return (
    <article
      className="app-panel mx-4 mb-3 rounded-[1.8rem] p-4 animate-fade-in"
      style={{ contentVisibility: "auto", containIntrinsicSize: "420px" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt={getDisplayName()}
              className="w-10 h-10 rounded-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="orange-glow flex h-10 w-10 items-center justify-center rounded-full wemovelt-gradient font-bold text-primary-foreground">
              {getInitial()}
            </div>
          )}
          <div>
            <p className="font-bold text-sm">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground">
              {getUsername()} · {getTimeAgo()}
            </p>
          </div>
        </div>
        
        {isOwner && onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="app-icon-button flex h-10 w-10 items-center justify-center">
                <MoreHorizontal size={18} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete(post.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={16} className="mr-2" />
                Excluir post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <p className="mb-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        <div className="mb-3 overflow-hidden rounded-[1.5rem]">
          <img
            src={post.image_url}
            alt="Publicacao"
            className="w-full h-48 object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="flex items-center gap-6 rounded-full border border-white/6 bg-white/[0.03] px-4 py-3">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 transition-all ${
            post.user_has_liked
              ? "text-red-500 scale-110"
              : "text-muted-foreground hover:text-red-400"
          }`}
        >
          <Heart size={20} fill={post.user_has_liked ? "currentColor" : "none"} />
          <span className="text-sm">{post.likes_count}</span>
        </button>

        <button
          onClick={() => onComment(post)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle size={20} />
          <span className="text-sm">{post.comments_count}</span>
        </button>

        <button
          onClick={() => onShare(post)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Share2 size={20} />
        </button>
      </div>
    </article>
  );
};

export default PostCard;
