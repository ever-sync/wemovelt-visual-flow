import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GymData {
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
  image_url?: string | null;
}

interface UpdateGymData extends GymData {
  id: string;
}

export const useAdminGyms = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createGym = useMutation({
    mutationFn: async (data: GymData) => {
      const { error } = await supabase
        .from("gyms")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gyms"] });
      toast({
        title: "Academia criada",
        description: "A academia foi adicionada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateGym = useMutation({
    mutationFn: async ({ id, ...data }: UpdateGymData) => {
      const { error } = await supabase
        .from("gyms")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gyms"] });
      toast({
        title: "Academia atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteGym = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gyms")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gyms"] });
      toast({
        title: "Academia excluída",
        description: "A academia foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { createGym, updateGym, deleteGym };
};
