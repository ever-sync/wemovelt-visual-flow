import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type WorkoutSession = Tables<"workout_sessions">;

export interface WorkoutStats {
  totalSessions: number;
  totalMinutes: number;
  averageDuration: number;
  sessionsThisWeek: number;
}

export const useWorkoutSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["workout_sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });
      
      if (error) throw error;
      return data as WorkoutSession[];
    },
    enabled: !!user,
  });

  const startSessionMutation = useMutation({
    mutationFn: async ({ workoutId, workoutName, totalExercises }: { 
      workoutId: string; 
      workoutName: string;
      totalExercises: number;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          workout_name: workoutName,
          total_exercises: totalExercises,
          status: "in_progress",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_sessions"] });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async ({ 
      sessionId, 
      exercisesCompleted, 
      notes 
    }: { 
      sessionId: string; 
      exercisesCompleted: number;
      notes?: string;
    }) => {
      const startedSession = sessions?.find(s => s.id === sessionId);
      const startedAt = startedSession?.started_at ? new Date(startedSession.started_at) : new Date();
      const finishedAt = new Date();
      const durationMinutes = Math.round((finishedAt.getTime() - startedAt.getTime()) / 60000);
      
      const { error } = await supabase
        .from("workout_sessions")
        .update({
          finished_at: finishedAt.toISOString(),
          duration_minutes: durationMinutes,
          exercises_completed: exercisesCompleted,
          status: "completed",
          notes,
        })
        .eq("id", sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_sessions"] });
    },
  });

  const abandonSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("workout_sessions")
        .update({
          finished_at: new Date().toISOString(),
          status: "abandoned",
        })
        .eq("id", sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_sessions"] });
    },
  });

  // Calculate stats
  const getStats = (): WorkoutStats => {
    const completedSessions = sessions?.filter(s => s.status === "completed") ?? [];
    const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0);
    
    // Sessions this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const sessionsThisWeek = completedSessions.filter(
      s => new Date(s.started_at!) > weekAgo
    ).length;
    
    return {
      totalSessions: completedSessions.length,
      totalMinutes,
      averageDuration: completedSessions.length > 0 
        ? Math.round(totalMinutes / completedSessions.length) 
        : 0,
      sessionsThisWeek,
    };
  };

  const currentSession = sessions?.find(s => s.status === "in_progress") ?? null;

  return {
    sessions: sessions ?? [],
    currentSession,
    isLoading,
    startSession: startSessionMutation.mutateAsync,
    completeSession: completeSessionMutation.mutateAsync,
    abandonSession: abandonSessionMutation.mutateAsync,
    getStats,
  };
};
