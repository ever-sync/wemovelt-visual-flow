import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Heart, MessageCircle, Share2, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import PostModal from "@/components/modals/PostModal";
import { useToast } from "@/hooks/use-toast";

const posts = [
  {
    id: 1,
    user: { name: "Maria Silva", username: "@mariasilva", avatar: "M" },
    content: "Mais um dia de treino concluído! 💪 A academia ao ar livre perto de casa está me ajudando muito a manter a rotina. Quem mais treina por lá?",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    likes: 24,
    comments: 5,
    time: "2h",
    liked: false,
  },
  {
    id: 2,
    user: { name: "João Pedro", username: "@joaopedro", avatar: "J" },
    content: "🏆 Meta da semana: treinar 5 dias! Já completei 4. Amanhã fecho com chave de ouro!",
    image: null,
    likes: 18,
    comments: 3,
    time: "4h",
    liked: true,
  },
  {
    id: 3,
    user: { name: "Ana Costa", username: "@anacosta", avatar: "A" },
    content: "Dica para quem está começando: não desista nas primeiras semanas! O corpo precisa de tempo para se adaptar. Confiem no processo! 🌟",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    likes: 42,
    comments: 12,
    time: "6h",
    liked: false,
  },
];

const Comunidade = () => {
  const { toast } = useToast();
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({
    2: true,
  });

  const handleLike = (postId: number) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    if (!likedPosts[postId]) {
      toast({
        title: "Você curtiu este post! ❤️",
        duration: 2000,
      });
    }
  };

  const handleComment = () => {
    toast({
      title: "Comentários",
      description: "Funcionalidade em breve!",
      duration: 2000,
    });
  };

  const handleShare = () => {
    toast({
      title: "Compartilhar",
      description: "Link copiado!",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-14 max-w-md mx-auto">
        {/* Feed */}
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <article key={post.id} className="p-4 animate-fade-in">
              {/* Post header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 wemovelt-gradient rounded-full flex items-center justify-center font-bold">
                    {post.user.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground">{post.user.username} · {post.time}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <MoreHorizontal size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* Post content */}
              <p className="text-sm mb-3 leading-relaxed">{post.content}</p>
              
              {post.image && (
                <div className="rounded-2xl overflow-hidden mb-3">
                  <img 
                    src={post.image} 
                    alt="Post"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Post actions */}
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-all ${
                    likedPosts[post.id] ? "text-red-500 scale-110" : "text-muted-foreground hover:text-red-400"
                  }`}
                >
                  <Heart size={20} fill={likedPosts[post.id] ? "currentColor" : "none"} />
                  <span className="text-sm">{post.likes + (likedPosts[post.id] && !post.liked ? 1 : 0)}</span>
                </button>
                
                <button 
                  onClick={handleComment}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle size={20} />
                  <span className="text-sm">{post.comments}</span>
                </button>
                
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setPostModalOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 wemovelt-gradient rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      <BottomNav />
      <PostModal open={postModalOpen} onOpenChange={setPostModalOpen} />
    </div>
  );
};

export default Comunidade;
