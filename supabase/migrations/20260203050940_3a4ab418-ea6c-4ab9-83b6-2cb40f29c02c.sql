-- Create user_goals table for tracking user goals
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  target INTEGER NOT NULL,
  unit TEXT NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_goals
CREATE POLICY "Users can view own goals"
ON public.user_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
ON public.user_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
ON public.user_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
ON public.user_goals FOR DELETE
USING (auth.uid() = user_id);

-- Create habit_logs table for daily habit tracking
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  habit_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  value INTEGER,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, habit_type, date)
);

-- Enable RLS
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for habit_logs
CREATE POLICY "Users can view own habit logs"
ON public.habit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs"
ON public.habit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs"
ON public.habit_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs"
ON public.habit_logs FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on user_goals
CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();