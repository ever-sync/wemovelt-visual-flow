import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EquipmentData {
  name: string;
  description?: string | null;
  video_url?: string | null;
  category?: string | null;
  difficulty?: string | null;
  gym_id?: string | null;
  muscles?: string[] | null;
  image_url?: string | null;
  qr_code?: string | null;
  specifications?: string[] | null;
  usage_instructions?: string | null;
  primary_function?: string | null;
}

interface UpdateEquipmentData extends EquipmentData {
  id: string;
}

export const useAdminEquipment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEquipment = useMutation({
    mutationFn: async (data: EquipmentData) => {
      const { error } = await supabase
        .from("equipment")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Equipamento criado",
        description: "O equipamento foi adicionado com sucesso.",
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

  const updateEquipment = useMutation({
    mutationFn: async ({ id, ...data }: UpdateEquipmentData) => {
      const { error } = await supabase
        .from("equipment")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Equipamento atualizado",
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

  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Equipamento excluído",
        description: "O equipamento foi removido com sucesso.",
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

  return { createEquipment, updateEquipment, deleteEquipment };
};
