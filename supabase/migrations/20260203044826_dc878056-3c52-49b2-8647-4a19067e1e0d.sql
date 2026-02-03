-- Tabela de treinos do usuário
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  frequency INTEGER,
  difficulty TEXT,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
ON public.workouts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
ON public.workouts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
ON public.workouts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
ON public.workouts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON public.workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de exercícios de um treino
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.equipment(id),
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '12',
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para workout_exercises
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exercises via workout"
ON public.workout_exercises FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workouts w 
    WHERE w.id = workout_id AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert exercises via workout"
ON public.workout_exercises FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workouts w 
    WHERE w.id = workout_id AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update exercises via workout"
ON public.workout_exercises FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workouts w 
    WHERE w.id = workout_id AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete exercises via workout"
ON public.workout_exercises FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workouts w 
    WHERE w.id = workout_id AND w.user_id = auth.uid()
  )
);

-- Tabela de sessões de treino realizados
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  exercises_completed INTEGER DEFAULT 0,
  total_exercises INTEGER,
  status TEXT DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para workout_sessions
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
ON public.workout_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON public.workout_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.workout_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);