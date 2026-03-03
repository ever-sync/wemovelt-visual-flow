

## Problem

1. **Category, Difficulty, and Academy selects** may not be saving correctly because the Radix Select component doesn't handle empty string `""` as a valid uncontrolled state — it needs `undefined` to show the placeholder.
2. **Missing field**: Need to add a "Especificações Técnicas" (Technical Specifications) list field to equipment, like the reference image shows (bullet-point list of specs).

## Plan

### 1. Database migration
Add a `specifications` column (text array) to the `equipment` table:
```sql
ALTER TABLE public.equipment ADD COLUMN specifications text[] DEFAULT NULL;
```

### 2. Fix EquipmentForm select handling
In `src/components/admin/EquipmentForm.tsx`:
- Change Select `value` props to use `undefined` instead of `""` when no value is selected, so the placeholder renders correctly
- For category: `value={formData.category || undefined}`
- For difficulty: `value={formData.difficulty || undefined}`
- For gym: keep current logic (already uses `"none"` sentinel)

### 3. Add Specifications list field
In `src/components/admin/EquipmentForm.tsx`:
- Add a dynamic list input below the gym select where the admin can add/remove specification lines (free text)
- Each line has an input + remove button; a "+ Adicionar" button appends a new empty line
- Stored as `string[]` in `formData.specifications`

### 4. Update types and hooks
- Update `Equipment` interfaces in `AdminEquipmentTab.tsx`, `EquipmentForm.tsx`, and `useAdminEquipment.ts` to include `specifications?: string[] | null`
- The types.ts file will auto-update after migration

### Files changed
- `src/components/admin/EquipmentForm.tsx` — fix selects, add specifications field
- `src/components/admin/AdminEquipmentTab.tsx` — update Equipment interface
- `src/hooks/useAdminEquipment.ts` — update EquipmentData interface
- New migration for `specifications` column

