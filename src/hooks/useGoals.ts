import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, format } from "date-fns";
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

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
    staleTime: STALE_TIME,
  });

  const { data: goalsWithProgress = [] } = useQuery({
    queryKey: ["goals-with-progress", user?.id, goals],
    queryFn: async () => {
      if (!user || goals.length === 0) return [];
      
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const goalsProgress: GoalWithProgress[] = await Promise.all(
        goals.map(async (goal) => {
          let current = 0;
          
          if (goal.type === "workout") {
            // Count check-ins for the week
            const { count } = await supabase
              .from("check_ins")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .gte("created_at", weekStart.toISOString())
              .lte("created_at", weekEnd.toISOString());
            
            current = count || 0;
          } else {
            // Count completed habit logs for the week
            const { data: logs } = await supabase
              .from("habit_logs")
              .select("*")
              .eq("user_id", user.id)
              .eq("habit_type", goal.type)
              .eq("completed", true)
              .gte("date", format(weekStart, "yyyy-MM-dd"))
              .lte("date", format(weekEnd, "yyyy-MM-dd"));
            
            current = logs?.length || 0;
          }
          
          const percentage = Math.min(Math.round((current / goal.target) * 100), 100);
          
          return { ...goal, current, percentage };
        })
      );
      
      return goalsProgress;
    },
    enabled: !!user && goals.length > 0,
    staleTime: STALE_TIME,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: {
      type: string;
      target: number;
      unit: string;
      title: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

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
      queryClient.invalidateQueries({ queryKey: ["goals"] });
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
      queryClient.invalidateQueries({ queryKey: ["goals"] });
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
      queryClient.invalidateQueries({ queryKey: ["goals"] });
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
