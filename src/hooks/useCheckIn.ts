import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, format, addDays, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface CheckIn {
  id: string;
  user_id: string;
  gym_id: string | null;
  equipment_id: string | null;
  method: string;
  lat: number | null;
  lng: number | null;
  created_at: string | null;
}

export interface WeekDay {
  day: string;
  date: number;
  fullDate: string;
  checked: boolean | null;
}

export interface UseCheckInReturn {
  checkIns: CheckIn[];
  isLoading: boolean;
  error: Error | null;
  streak: number;
  weeklyPercentage: number;
  todayCheckedIn: boolean;
  weekData: WeekDay[];
  registerCheckIn: (
    method: "qr" | "geo",
    gymId: string,
    equipmentId?: string,
    lat?: number,
    lng?: number
  ) => Promise<CheckIn>;
  getCheckInsForDate: (date: string) => CheckIn[];
}

const calculateStreak = (checkIns: CheckIn[]): number => {
  if (checkIns.length === 0) return 0;

  // Get unique dates sorted descending
  const sortedDates = [...new Set(
    checkIns
      .filter((c) => c.created_at)
      .map((c) => format(parseISO(c.created_at!), "yyyy-MM-dd"))
  )].sort().reverse();

  if (sortedDates.length === 0) return 0;

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(addDays(new Date(), -1), "yyyy-MM-dd");

  // Check if the most recent check-in is today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = parseISO(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseISO(sortedDates[i]);
    const diff = differenceInDays(currentDate, prevDate);

    if (diff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

export const useCheckIn = (): UseCheckInReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch check-ins from database
  const { data: checkIns = [], isLoading, error } = useQuery({
    queryKey: ["check-ins", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CheckIn[];
    },
    enabled: !!user,
  });

  // Register check-in mutation
  const registerMutation = useMutation({
    mutationFn: async ({
      method,
      gymId,
      equipmentId,
      lat,
      lng,
    }: {
      method: "qr" | "geo";
      gymId: string;
      equipmentId?: string;
      lat?: number;
      lng?: number;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("check_ins")
        .insert({
          user_id: user.id,
          gym_id: gymId,
          equipment_id: equipmentId || null,
          method,
          lat: lat || null,
          lng: lng || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Vibrate on success if available
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      return data as CheckIn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check-ins", user?.id] });
    },
  });

  const registerCheckIn = useCallback(
    async (
      method: "qr" | "geo",
      gymId: string,
      equipmentId?: string,
      lat?: number,
      lng?: number
    ): Promise<CheckIn> => {
      return registerMutation.mutateAsync({ method, gymId, equipmentId, lat, lng });
    },
    [registerMutation]
  );

  const getCheckInsForDate = useCallback(
    (date: string): CheckIn[] => {
      return checkIns.filter(
        (c) => c.created_at && format(parseISO(c.created_at), "yyyy-MM-dd") === date
      );
    },
    [checkIns]
  );

  // Calculate week data
  const weekData = useMemo((): WeekDay[] => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const days: WeekDay[] = [];
    const todayStr = format(today, "yyyy-MM-dd");
    const checkInDates = new Set(
      checkIns
        .filter((c) => c.created_at)
        .map((c) => format(parseISO(c.created_at!), "yyyy-MM-dd"))
    );

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const isFuture = dateStr > todayStr;
      const hasCheckIn = checkInDates.has(dateStr);

      days.push({
        day:
          format(date, "EEE", { locale: ptBR }).slice(0, 3).charAt(0).toUpperCase() +
          format(date, "EEE", { locale: ptBR }).slice(1, 3),
        date: date.getDate(),
        fullDate: dateStr,
        checked: isFuture ? null : hasCheckIn,
      });
    }

    return days;
  }, [checkIns]);

  // Calculate today's status
  const todayCheckedIn = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return checkIns.some(
      (c) => c.created_at && format(parseISO(c.created_at), "yyyy-MM-dd") === today
    );
  }, [checkIns]);

  // Calculate streak
  const streak = useMemo(() => calculateStreak(checkIns), [checkIns]);

  // Calculate weekly percentage
  const weeklyPercentage = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const pastDays = weekData.filter((d) => d.fullDate <= today);
    const checkedDays = pastDays.filter((d) => d.checked === true).length;
    return pastDays.length > 0 ? Math.round((checkedDays / pastDays.length) * 100) : 0;
  }, [weekData]);

  return {
    checkIns,
    isLoading,
    error: error as Error | null,
    streak,
    weeklyPercentage,
    todayCheckedIn,
    weekData,
    registerCheckIn,
    getCheckInsForDate,
  };
};
