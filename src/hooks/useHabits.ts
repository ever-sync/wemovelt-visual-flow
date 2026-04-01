import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, endOfWeek, addDays, parseISO, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { habitTypeSchema, validateOrThrow } from "@/lib/validations";

const STALE_TIME_TODAY = 1000 * 60; // 1 minute for today's habits
const STALE_TIME_WEEKLY = 1000 * 60 * 5; // 5 minutes for weekly data

export interface HabitLog {
  id: string;
  user_id: string;
  habit_type: string;
  date: string;
  value: number | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface HabitStats {
  type: string;
  completedDays: number;
  streak: number;
  weeklyData: { day: string; completed: boolean }[];
}

const HABIT_TYPES = ["hydration", "sleep", "nutrition", "wellness"] as const;
type HabitType = typeof HABIT_TYPES[number];

const calculateStreak = (logs: HabitLog[]): number => {
  if (logs.length === 0) return 0;
  
  const completedDates = [...new Set(
    logs
      .filter(l => l.completed)
      .map(l => l.date)
  )].sort().reverse();
  
  if (completedDates.length === 0) return 0;
  
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(addDays(new Date(), -1), "yyyy-MM-dd");
  
  // Streak only counts if last completion was today or yesterday
  if (completedDates[0] !== today && completedDates[0] !== yesterday) {
    return 0;
  }
  
  let streak = 1;
  for (let i = 1; i < completedDates.length; i++) {
    const diff = differenceInDays(
      parseISO(completedDates[i - 1]),
      parseISO(completedDates[i])
    );
    if (diff === 1) streak++;
    else break;
  }
  
  return streak;
};

export const useHabits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // Get today's logs
  const { data: todayLogs = [], isLoading: loadingToday } = useQuery({
    queryKey: ["habits-today", user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today);
      
      if (error) throw error;
      return data as HabitLog[];
    },
    enabled: !!user,
    staleTime: STALE_TIME_TODAY,
  });

  // Get weekly logs for stats
  const { data: weeklyLogs = [], isLoading: loadingWeekly } = useQuery({
    queryKey: ["habits-weekly", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", format(weekStart, "yyyy-MM-dd"))
        .lte("date", format(weekEnd, "yyyy-MM-dd"));
      
      if (error) throw error;
      return data as HabitLog[];
    },
    enabled: !!user,
    staleTime: STALE_TIME_WEEKLY,
  });

  // Get all logs for streak calculation (last 30 days)
  const { data: allLogs = [] } = useQuery({
    queryKey: ["habits-all", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const thirtyDaysAgo = format(addDays(new Date(), -30), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", thirtyDaysAgo)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data as HabitLog[];
    },
    enabled: !!user,
    staleTime: STALE_TIME_WEEKLY,
  });

  // Calculate weekly stats for each habit type
  const weeklyStats: HabitStats[] = HABIT_TYPES.map((type) => {
    const typeLogs = allLogs.filter(l => l.habit_type === type);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = format(addDays(weekStart, i), "yyyy-MM-dd");
      const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      const log = weeklyLogs.find(l => l.habit_type === type && l.date === date);
      
      return {
        day: dayNames[i],
        completed: log?.completed || false,
      };
    });
    
    return {
      type,
      completedDays: weeklyData.filter(d => d.completed).length,
      streak: calculateStreak(typeLogs),
      weeklyData,
    };
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitType, date = today }: { habitType: string; date?: string }) => {
      if (!user) throw new Error("Usuario nao autenticado");

      // Validate habit type
      validateOrThrow(habitTypeSchema, habitType);
      
      // Check if log exists
      const { data: existing } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("habit_type", habitType)
        .eq("date", date)
        .single();
      
      if (existing) {
        // Toggle completed state
        const { data, error } = await supabase
          .from("habit_logs")
          .update({ completed: !existing.completed })
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new log as completed
        const { data, error } = await supabase
          .from("habit_logs")
          .insert({
            user_id: user.id,
            habit_type: habitType,
            date,
            completed: true,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits-today"] });
      queryClient.invalidateQueries({ queryKey: ["habits-weekly"] });
      queryClient.invalidateQueries({ queryKey: ["habits-all"] });
    },
  });

  const updateHabitValueMutation = useMutation({
    mutationFn: async ({ 
      habitType, 
      value, 
      date = today 
    }: { 
      habitType: string; 
      value: number; 
      date?: string;
    }) => {
      if (!user) throw new Error("Usuario nao autenticado");
      
      // Upsert the log with the value
      const { data: existing } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("habit_type", habitType)
        .eq("date", date)
        .single();
      
      if (existing) {
        const { data, error } = await supabase
          .from("habit_logs")
          .update({ value, completed: true })
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("habit_logs")
          .insert({
            user_id: user.id,
            habit_type: habitType,
            date,
            value,
            completed: true,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits-today"] });
      queryClient.invalidateQueries({ queryKey: ["habits-weekly"] });
      queryClient.invalidateQueries({ queryKey: ["habits-all"] });
      toast.success("Valor atualizado!");
    },
  });

  const isHabitCompleted = (habitType: string): boolean => {
    return todayLogs.some(log => log.habit_type === habitType && log.completed);
  };

  const getHabitValue = (habitType: string): number | null => {
    const log = todayLogs.find(l => l.habit_type === habitType);
    return log?.value ?? null;
  };

  const getStreakForHabit = (habitType: string): number => {
    const stats = weeklyStats.find(s => s.type === habitType);
    return stats?.streak || 0;
  };

  return {
    todayLogs,
    weeklyLogs,
    weeklyStats,
    isLoading: loadingToday || loadingWeekly,
    toggleHabit: toggleHabitMutation.mutateAsync,
    updateHabitValue: updateHabitValueMutation.mutateAsync,
    isHabitCompleted,
    getHabitValue,
    getStreakForHabit,
    isToggling: toggleHabitMutation.isPending,
  };
};
