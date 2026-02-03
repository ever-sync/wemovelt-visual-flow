import { z } from "zod";

// === Auth ===
export const emailSchema = z
  .string()
  .trim()
  .email("E-mail inválido")
  .max(255, "E-mail muito longo");

export const passwordSchema = z
  .string()
  .min(6, "Mínimo 6 caracteres")
  .max(72, "Máximo 72 caracteres"); // limite bcrypt

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Nome muito curto")
  .max(100, "Nome muito longo");

// === Profile ===
export const profileSchema = z.object({
  name: nameSchema,
  age: z.number().min(13, "Idade mínima 13 anos").max(120, "Idade máxima 120 anos").nullable().optional(),
  weight: z.number().min(20, "Peso mínimo 20kg").max(500, "Peso máximo 500kg").nullable().optional(),
  height: z.number().min(50, "Altura mínima 50cm").max(300, "Altura máxima 300cm").nullable().optional(),
  goal: z.string().max(50, "Objetivo muito longo").nullable().optional(),
  experience_level: z.enum(["iniciante", "intermediario", "avancado"]).nullable().optional(),
});

// === Posts ===
export const postContentSchema = z
  .string()
  .trim()
  .min(1, "Post não pode estar vazio")
  .max(2000, "Máximo 2000 caracteres");

export const commentSchema = z
  .string()
  .trim()
  .min(1, "Comentário não pode estar vazio")
  .max(500, "Máximo 500 caracteres");

// === Goals ===
export const goalSchema = z.object({
  type: z.enum(["workout", "hydration", "sleep", "nutrition"], {
    errorMap: () => ({ message: "Tipo de meta inválido" }),
  }),
  target: z.number().min(1, "Meta mínima é 1").max(7, "Meta máxima é 7"),
  unit: z.string().max(50, "Unidade muito longa"),
  title: z.string().max(100, "Título muito longo"),
});

// === Image Upload ===
export const imageFileSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, "Imagem deve ter no máximo 5MB"),
  type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/i, "Formato de imagem inválido. Use JPEG, PNG, GIF ou WebP"),
});

// === Habits ===
export const habitTypeSchema = z.enum(["hydration", "sleep", "nutrition", "wellness"], {
  errorMap: () => ({ message: "Tipo de hábito inválido" }),
});

// Validation helper functions
export const validateOrThrow = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }
  return result.data;
};

export const validateSafe = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }
  return { success: true, data: result.data };
};
