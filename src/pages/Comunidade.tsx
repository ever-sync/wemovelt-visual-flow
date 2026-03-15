import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Plus } from "lucide-react";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts, Post } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isNativeApp, shareContent } from "@/lib/native";

const PostModal = lazy(() => import("@/components/modals/PostModal"));
const CommentsModal = lazy(() => import("@/components/modals/CommentsModal"));

const Comunidade = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { posts, isLoading, isFetching, hasNextPage, fetchNextPage, toggleLike, deletePost } = usePosts();

  useEffect(() => {
    setVisibleCount((current) => Math.max(current, Math.min(posts.length || 8, 8)));
  }, [posts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          if (visibleCount < posts.length) {
            setVisibleCount((current) => Math.min(current + 6, posts.length));
            return;
          }

          if (hasNextPage) {
            fetchNextPage();
          }
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, posts.length, visibleCount]);

  const handleLike = (postId: string) => {
    if (!user) {
      toast({
        title: "Faca login",
        description: "Voce precisa estar logado para curtir posts.",
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
    void shareContent({
        title: "Post da Comunidade WEMOVELT",
        text: post.content.substring(0, 100),
        url: isNativeApp() ? undefined : window.location.href,
      })
      .then((result) => {
        if (result === "copied") {
          toast({
            title: "Link copiado",
            description: "O link foi copiado para a area de transferencia.",
            duration: 2000,
          });
        }
      })
      .catch(() => {
        toast({
          title: "Nao foi possivel compartilhar",
          description: "Tente novamente em alguns instantes.",
          duration: 2000,
        });
      });
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
        title: "Faca login",
        description: "Voce precisa estar logado para criar posts.",
        duration: 3000,
      });
      return;
    }
    setPostModalOpen(true);
  };

  return (
    <div className="app-shell" style={{ paddingBottom: "calc(8.5rem + env(safe-area-inset-bottom))" }}>
      <Header />

      <main className="app-screen space-y-4 pt-[calc(6.75rem+env(safe-area-inset-top))]">
        <section className="animate-fade-in">
          <div className="app-panel relative overflow-hidden rounded-[2rem] p-6">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/18 blur-3xl" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="app-kicker">Comunidade</p>
                <h1 className="mt-1 text-[2rem] font-bold tracking-[-0.07em]">Compartilhe seu movimento.</h1>
                <p className="mt-3 max-w-[30ch] text-sm leading-6 text-muted-foreground">
                  Feed mais limpo, foco no conteudo e acoes claras para comentar, curtir e publicar.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-primary/12 text-primary">
                <MessageSquare size={22} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3" style={{ contentVisibility: "auto", containIntrinsicSize: "960px" }}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="app-panel rounded-[1.8rem] p-4">
                <div className="mb-4 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-white/[0.06]" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                    <Skeleton className="h-3 w-32 bg-white/[0.05]" />
                  </div>
                </div>
                <Skeleton className="mb-4 h-16 w-full bg-white/[0.05]" />
                <Skeleton className="h-10 w-full rounded-full bg-white/[0.05]" />
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="app-panel rounded-[1.8rem] py-16 text-center">
              <p className="text-muted-foreground">Nenhum post ainda.</p>
              <p className="mt-1 text-sm text-muted-foreground">Seja o primeiro a compartilhar algo.</p>
            </div>
          ) : (
            posts.slice(0, visibleCount).map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} onShare={handleShare} onDelete={handleDelete} />
            ))
          )}
        </section>

        <div ref={loadMoreRef} className="flex h-10 items-center justify-center">
          {isFetching && !isLoading && <Loader2 size={24} className="animate-spin text-muted-foreground" />}
        </div>
      </main>

      <button
        onClick={handleNewPost}
        className="orange-glow fixed bottom-[6.35rem] left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full wemovelt-gradient text-primary-foreground transition-transform hover:-translate-x-1/2 hover:-translate-y-1"
        aria-label="Novo post"
      >
        <Plus size={24} />
      </button>

      <BottomNav />
      <WhatsAppFAB />

      <Suspense fallback={null}>
        {postModalOpen && <PostModal open={postModalOpen} onOpenChange={setPostModalOpen} />}
        {commentsModalOpen && <CommentsModal open={commentsModalOpen} onOpenChange={setCommentsModalOpen} post={selectedPost} />}
      </Suspense>
    </div>
  );
};

export default Comunidade;
