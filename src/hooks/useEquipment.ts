import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Equipment = Tables<"equipment">;

export const useEquipment = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Equipment[];
    },
  });

  const categories = data
    ? [...new Set(data.filter(e => e.category).map(e => e.category!))]
    : [];

  return { 
    equipment: data ?? [], 
    isLoading, 
    error,
    categories 
  };
};

export const useEquipmentById = (id: string | null) => {
  const { data, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Equipment;
    },
    enabled: !!id,
  });

  return { equipment: data, isLoading };
};
