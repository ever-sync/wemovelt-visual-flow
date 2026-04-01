import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { goalSchema, validateOrThrow } from "@/lib/validations";

const STALE_TIME = 1000 * 60 * 5; // 5 minutes for goals

export interface Goal {
  id: string;
  user_id: string;
  type: string;
  target: number;
  unit: string;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalWithProgress extends Goal {
  current: number;
  percentage: number;
}

export const useGoals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goalsWithProgress = [], isLoading } = useQuery({
    queryKey: ["goals-with-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc("get_active_goals_with_progress");

      if (error) throw error;
      return (data ?? []) as GoalWithProgress[];
    },
    enabled: !!user,
    staleTime: STALE_TIME,
  });

  const goals = goalsWithProgress.map(({ current, percentage, ...goal }) => goal);

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: {
      type: string;
      target: number;
      unit: string;
      title: string;
    }) => {
      if (!user) throw new Error("Usuario nao autenticado");

      // Validate goal data
      validateOrThrow(goalSchema, goalData);
      
      const { data, error } = await supabase
        .from("user_goals")
        .insert({
          user_id: user.id,
          ...goalData,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals-with-progress"] });
      toast.success("Meta criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar meta");
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      const { data, error } = await supabase
        .from("user_goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals-with-progress"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from("user_goals")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals-with-progress"] });
      toast.success("Meta removida");
    },
  });

  return {
    goals,
    goalsWithProgress,
    isLoading,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
  };
};
