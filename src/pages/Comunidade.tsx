import { useRef, useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Plus, Loader2 } from "lucide-react";
import PostModal from "@/components/modals/PostModal";
import CommentsModal from "@/components/modals/CommentsModal";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts, Post } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Comunidade = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    posts,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    toggleLike,
    deletePost,
  } = usePosts();

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetching]);

  const handleLike = (postId: string) => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para curtir posts.",
        duration: 3000,
      });
      return;
    }
    toggleLike(postId);
  };

  const handleComment = (post: Post) => {
    setSelectedPost(post);
    setCommentsModalOpen(true);
  };

  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: "Post da Comunidade WeMoveIt",
        text: post.content.substring(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
        duration: 2000,
      });
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleNewPost = () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para criar posts.",
        duration: 3000,
      });
      return;
    }
    setPostModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="pt-20 max-w-md mx-auto">
        {/* Feed */}
        <div className="divide-y divide-border">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">Nenhum post ainda.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Seja o primeiro a compartilhar algo!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
          {isFetching && !isLoading && (
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={handleNewPost}
        className="fixed bottom-20 right-4 w-14 h-14 wemovelt-gradient rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      <BottomNav />
      <PostModal open={postModalOpen} onOpenChange={setPostModalOpen} />
      <CommentsModal
        open={commentsModalOpen}
        onOpenChange={setCommentsModalOpen}
        post={selectedPost}
      />
    </div>
  );
};

export default Comunidade;
