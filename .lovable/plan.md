

## Problem

The admin panel cannot delete gyms or equipment due to foreign key constraints:
1. **Gyms**: `check_ins.gym_id` references `gyms.id` — blocks gym deletion
2. **Equipment**: `workout_exercises.equipment_id` references `equipment.id` — blocks equipment deletion

Both `gym_id` and `equipment_id` are nullable columns, so the correct fix is to change the foreign keys to `ON DELETE SET NULL`. This preserves the check-in and exercise records but clears the reference to the deleted gym/equipment.

## Plan

**Single database migration** to drop and recreate both foreign keys with `ON DELETE SET NULL`:

```sql
-- Fix check_ins -> gyms FK
ALTER TABLE public.check_ins
  DROP CONSTRAINT check_ins_gym_id_fkey,
  ADD CONSTRAINT check_ins_gym_id_fkey
    FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE SET NULL;

-- Fix workout_exercises -> equipment FK
ALTER TABLE public.workout_exercises
  DROP CONSTRAINT workout_exercises_equipment_id_fkey,
  ADD CONSTRAINT workout_exercises_equipment_id_fkey
    FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE SET NULL;
```

No code changes needed — the admin hooks already handle delete correctly. After this migration, deleting a gym or equipment will succeed and simply null out the references in related records.

