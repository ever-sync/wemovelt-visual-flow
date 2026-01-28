import { useState, useCallback, useEffect } from "react";
import { startOfWeek, format, addDays, isToday, parseISO, differenceInDays, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface CheckIn {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  method: "qr" | "geo";
  gymId?: string;
  gymName?: string;
  equipmentId?: string;
  equipmentName?: string;
  timestamp: number;
}

export interface WeekDay {
  day: string;
  date: number;
  fullDate: string;
  checked: boolean | null; // true = checked in, false = missed, null = future
}

export interface UseCheckInReturn {
  checkIns: CheckIn[];
  streak: number;
  weeklyPercentage: number;
  todayCheckedIn: boolean;
  weekData: WeekDay[];
  registerCheckIn: (
    method: "qr" | "geo",
    gymId?: string,
    gymName?: string,
    equipmentId?: string,
    equipmentName?: string
  ) => void;
  getCheckInsForDate: (date: string) => CheckIn[];
}

const STORAGE_KEY = "wemovelt_checkins";

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

const getStoredCheckIns = (): CheckIn[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCheckIns = (checkIns: CheckIn[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
};

const calculateStreak = (checkIns: CheckIn[]): number => {
  if (checkIns.length === 0) return 0;

  // Sort by date descending
  const sortedDates = [...new Set(checkIns.map((c) => c.date))].sort().reverse();

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
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setCheckIns(getStoredCheckIns());
  }, []);

  const registerCheckIn = useCallback(
    (
      method: "qr" | "geo",
      gymId?: string,
      gymName?: string,
      equipmentId?: string,
      equipmentName?: string
    ) => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const newCheckIn: CheckIn = {
        id: generateId(),
        date: today,
        method,
        gymId,
        gymName,
        equipmentId,
        equipmentName,
        timestamp: Date.now(),
      };

      const updatedCheckIns = [...checkIns, newCheckIn];
      setCheckIns(updatedCheckIns);
      saveCheckIns(updatedCheckIns);

      // Vibrate on success if available
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    },
    [checkIns]
  );

  const getCheckInsForDate = useCallback(
    (date: string): CheckIn[] => {
      return checkIns.filter((c) => c.date === date);
    },
    [checkIns]
  );

  // Calculate week data
  const weekData: WeekDay[] = (() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const days: WeekDay[] = [];
    const todayStr = format(today, "yyyy-MM-dd");
    const checkInDates = new Set(checkIns.map((c) => c.date));

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const isFuture = dateStr > todayStr;
      const hasCheckIn = checkInDates.has(dateStr);

      days.push({
        day: format(date, "EEE", { locale: ptBR }).slice(0, 3).charAt(0).toUpperCase() + format(date, "EEE", { locale: ptBR }).slice(1, 3),
        date: date.getDate(),
        fullDate: dateStr,
        checked: isFuture ? null : hasCheckIn,
      });
    }

    return days;
  })();

  // Calculate today's status
  const todayCheckedIn = checkIns.some(
    (c) => c.date === format(new Date(), "yyyy-MM-dd")
  );

  // Calculate streak
  const streak = calculateStreak(checkIns);

  // Calculate weekly percentage
  const today = format(new Date(), "yyyy-MM-dd");
  const pastDays = weekData.filter((d) => d.fullDate <= today);
  const checkedDays = pastDays.filter((d) => d.checked === true).length;
  const weeklyPercentage =
    pastDays.length > 0 ? Math.round((checkedDays / pastDays.length) * 100) : 0;

  return {
    checkIns,
    streak,
    weeklyPercentage,
    todayCheckedIn,
    weekData,
    registerCheckIn,
    getCheckInsForDate,
  };
};
