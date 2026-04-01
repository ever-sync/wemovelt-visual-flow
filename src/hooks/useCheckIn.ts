import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import { startOfWeek, format, addDays, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const STALE_TIME = 1000 * 60;

export type CheckIn = Tables<"check_ins">;

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
  registerGeoCheckIn: (gymId: string, lat: number, lng: number) => Promise<CheckIn>;
  registerQrCheckIn: (qrCode: string) => Promise<CheckIn>;
  getCheckInsForDate: (date: string) => CheckIn[];
}

const calculateStreak = (checkIns: CheckIn[]): number => {
  if (checkIns.length === 0) return 0;

  const sortedDates = [...new Set(
    checkIns
      .filter((c) => c.created_at)
      .map((c) => format(parseISO(c.created_at!), "yyyy-MM-dd")),
  )].sort().reverse();

  if (sortedDates.length === 0) return 0;

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(addDays(new Date(), -1), "yyyy-MM-dd");

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = parseISO(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const previousDate = parseISO(sortedDates[i]);
    const diff = differenceInDays(currentDate, previousDate);

    if (diff === 1) {
      streak++;
      currentDate = previousDate;
    } else {
      break;
    }
  }

  return streak;
};

const normalizeCheckInError = (error: unknown): Error => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("CHECKIN_ALREADY_REGISTERED_TODAY")) {
    return new Error("Voce ja registrou presenca hoje.");
  }
  if (message.includes("CHECKIN_OUTSIDE_ALLOWED_RADIUS")) {
    return new Error("Voce esta fora do raio permitido para registro.");
  }
  if (message.includes("INVALID_QR_CODE")) {
    return new Error("QR Code invalido ou nao cadastrado.");
  }
  if (message.includes("MISSING_QR_CODE")) {
    return new Error("Informe um QR Code valido.");
  }
  if (message.includes("MISSING_GEO_CHECKIN_DATA")) {
    return new Error("Dados de localizacao insuficientes para registro.");
  }
  if (message.includes("GYM_NOT_FOUND")) {
    return new Error("Academia nao encontrada.");
  }

  return new Error(message);
};

export const useCheckIn = (): UseCheckInReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: checkIns = [], isLoading, error } = useQuery({
    queryKey: ["check-ins", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("check_ins")
        .select("id, user_id, gym_id, equipment_id, method, lat, lng, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CheckIn[];
    },
    enabled: !!user,
    staleTime: STALE_TIME,
  });

  const registerMutation = useMutation({
    mutationFn: async (
      input:
        | { method: "geo"; gymId: string; lat: number; lng: number }
        | { method: "qr"; qrCode: string },
    ) => {
      if (!user) throw new Error("Usuario nao autenticado");

      const rpcArgs =
        input.method === "geo"
          ? {
              p_method: "geo",
              p_gym_id: input.gymId,
              p_lat: input.lat,
              p_lng: input.lng,
              p_qr_code: null,
            }
          : {
              p_method: "qr",
              p_gym_id: null,
              p_lat: null,
              p_lng: null,
              p_qr_code: input.qrCode.trim(),
            };

      const { data, error } = await supabase.rpc("register_check_in_secure", rpcArgs);

      if (error) {
        throw normalizeCheckInError(error);
      }

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      return data as CheckIn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check-ins", user?.id] });
    },
  });

  const registerGeoCheckIn = useCallback(
    async (gymId: string, lat: number, lng: number) => {
      return registerMutation.mutateAsync({ method: "geo", gymId, lat, lng });
    },
    [registerMutation],
  );

  const registerQrCheckIn = useCallback(
    async (qrCode: string) => {
      return registerMutation.mutateAsync({ method: "qr", qrCode });
    },
    [registerMutation],
  );

  const getCheckInsForDate = useCallback(
    (date: string): CheckIn[] => {
      return checkIns.filter(
        (checkIn) => checkIn.created_at && format(parseISO(checkIn.created_at), "yyyy-MM-dd") === date,
      );
    },
    [checkIns],
  );

  const weekData = useMemo((): WeekDay[] => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const todayStr = format(today, "yyyy-MM-dd");
    const checkInDates = new Set(
      checkIns
        .filter((checkIn) => checkIn.created_at)
        .map((checkIn) => format(parseISO(checkIn.created_at!), "yyyy-MM-dd")),
    );

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateStr = format(date, "yyyy-MM-dd");
      const isFuture = dateStr > todayStr;
      const hasCheckIn = checkInDates.has(dateStr);

      const shortDay = format(date, "EEE", { locale: ptBR });

      return {
        day: shortDay.slice(0, 1).toUpperCase() + shortDay.slice(1, 3),
        date: date.getDate(),
        fullDate: dateStr,
        checked: isFuture ? null : hasCheckIn,
      };
    });
  }, [checkIns]);

  const todayCheckedIn = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return checkIns.some(
      (checkIn) => checkIn.created_at && format(parseISO(checkIn.created_at), "yyyy-MM-dd") === today,
    );
  }, [checkIns]);

  const streak = useMemo(() => calculateStreak(checkIns), [checkIns]);

  const weeklyPercentage = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const pastDays = weekData.filter((day) => day.fullDate <= today);
    const checkedDays = pastDays.filter((day) => day.checked === true).length;
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
    registerGeoCheckIn,
    registerQrCheckIn,
    getCheckInsForDate,
  };
};
