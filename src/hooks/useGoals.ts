import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { goalSchema, validateOrThrow } from "@/lib/validations";
import { endOfWeek, format, startOfWeek } from "date-fns";

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

const getGoalsWithProgressFallback = async (userId: string): Promise<GoalWithProgress[]> => {
  const { data: goalsData, error: goalsError } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (goalsError) throw goalsError;

  const goals = (goalsData ?? []) as Goal[];
  if (goals.length === 0) return [];

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [{ count: checkInCount, error: checkInsError }, { data: habitsData, error: habitsError }] = await Promise.all([
    supabase
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${weekStart}T00:00:00`)
      .lte("created_at", `${weekEnd}T23:59:59`),
    supabase
      .from("habit_logs")
      .select("habit_type")
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("date", weekStart)
      .lte("date", weekEnd),
  ]);

  if (checkInsError) throw checkInsError;
  if (habitsError) throw habitsError;

  const habitCounts = (habitsData ?? []).reduce<Record<string, number>>((acc, item) => {
    const key = item.habit_type ?? "";
    if (!key) return acc;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const workoutCount = checkInCount ?? 0;

  return goals.map((goal) => {
    const current = goal.type === "workout" ? workoutCount : habitCounts[goal.type] ?? 0;
    const percentage = goal.target > 0 ? Math.min(Math.round((current / goal.target) * 100), 100) : 0;
    return { ...goal, current, percentage };
  });
};

export const useGoals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goalsWithProgress = [], isLoading } = useQuery({
    queryKey: ["goals-with-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc("get_active_goals_with_progress");

      if (error) {
        console.warn("RPC get_active_goals_with_progress falhou; usando fallback local.", error);
        return getGoalsWithProgressFallback(user.id);
      }

      return (data ?? []) as GoalWithProgress[];
    },
    enabled: !!user,
    staleTime: STALE_TIME,
    retry: false,
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
