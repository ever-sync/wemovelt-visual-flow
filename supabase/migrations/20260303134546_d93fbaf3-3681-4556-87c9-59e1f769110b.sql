
-- Fix check_ins -> gyms FK to allow gym deletion
ALTER TABLE public.check_ins
  DROP CONSTRAINT check_ins_gym_id_fkey,
  ADD CONSTRAINT check_ins_gym_id_fkey
    FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE SET NULL;

-- Fix workout_exercises -> equipment FK to allow equipment deletion
ALTER TABLE public.workout_exercises
  DROP CONSTRAINT workout_exercises_equipment_id_fkey,
  ADD CONSTRAINT workout_exercises_equipment_id_fkey
    FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE SET NULL;
