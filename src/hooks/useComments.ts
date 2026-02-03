import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CommentProfile {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles: CommentProfile | null;
}

export const useComments = (postId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments for a post
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) return [];

      // Fetch comments
      const { data: commentsData, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!commentsData || commentsData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, username, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return commentsData.map((comment) => ({
        ...comment,
        profiles: profilesMap.get(comment.user_id) || null,
      })) as Comment[];
    },
    enabled: !!postId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string | null }) => {
      if (!user) throw new Error("Usuário não autenticado");
      if (!postId) throw new Error("Post não selecionado");

      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch profile for this comment
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, username, avatar_url")
        .eq("id", user.id)
        .single();

      return { ...data, profiles: profile } as Comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Comentário adicionado! 💬",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Erro ao comentar",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Comentário excluído",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    },
  });

  return {
    comments,
    isLoading,
    error,
    addComment: addCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutateAsync,
    isDeletingComment: deleteCommentMutation.isPending,
  };
};
