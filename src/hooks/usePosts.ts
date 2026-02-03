import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { postContentSchema, imageFileSchema, validateOrThrow } from "@/lib/validations";
import { sanitizeText } from "@/lib/sanitize";

const PAGE_SIZE = 10;
const STALE_TIME = 1000 * 30; // 30 seconds for social content

export interface PostProfile {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: PostProfile | null;
  user_has_liked?: boolean;
}

// Fetch profile for a user
const fetchProfileForUser = async (userId: string): Promise<PostProfile | null> => {
  const { data } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url")
    .eq("id", userId)
    .single();
  return data;
};

export const usePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Fetch posts
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (!posts || posts.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(posts.map((p) => p.user_id))];
      
      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, username, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      // If user is logged in, check which posts they've liked
      let likedPostIds = new Set<string>();
      if (user) {
        const postIds = posts.map((p) => p.id);
        const { data: userLikes } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        likedPostIds = new Set(userLikes?.map((l) => l.post_id) || []);
      }

      return posts.map((post) => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || null,
        user_has_liked: likedPostIds.has(post.id),
      })) as Post[];
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage && lastPage.length === PAGE_SIZE ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: STALE_TIME,
  });

  // Flatten pages into single array
  const posts = data?.pages.flat() || [];

  // Upload image to storage
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading image:", error);
      throw error;
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageFile }: { content: string; imageFile?: File | null }) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Validate and sanitize content
      const sanitizedContent = sanitizeText(content);
      validateOrThrow(postContentSchema, sanitizedContent);

      // Validate image if present
      if (imageFile) {
        validateOrThrow(imageFileSchema, {
          size: imageFile.size,
          type: imageFile.type,
        });
      }

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: sanitizedContent,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch the profile for this post
      const profile = await fetchProfileForUser(user.id);
      
      return { ...data, profiles: profile } as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post publicado! 🎉",
        description: "Seu post foi compartilhado com a comunidade.",
      });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível criar o post. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post excluído",
        description: "O post foi removido.",
      });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o post.",
        variant: "destructive",
      });
    },
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Check if user already liked
      const { data: existing } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        // Remove like
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "unliked" };
      } else {
        // Add like
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
        return { action: "liked" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (result.action === "liked") {
        toast({
          title: "Curtiu! ❤️",
          duration: 1500,
        });
      }
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
    },
  });

  return {
    posts,
    isLoading,
    isFetching,
    error,
    hasNextPage,
    fetchNextPage,
    createPost: createPostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
    deletePost: deletePostMutation.mutateAsync,
    isDeleting: deletePostMutation.isPending,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
  };
};
