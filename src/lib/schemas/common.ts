import { z } from 'zod';

// Schema para paginação
export const paginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1),
  total: z.number().min(0),
  pages: z.number().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Schema para resposta de sucesso genérica
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

// Schema para resposta de erro
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

// Schema para resposta de lista paginada
export const listResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  successResponseSchema(
    z.object({
      items: z.array(itemSchema),
      pagination: paginationSchema,
    })
  );

// Schema para resposta de item único
export const itemResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  successResponseSchema(itemSchema);

// Schema para resposta de estatísticas
export const statsResponseSchema = <T extends z.ZodTypeAny>(statsSchema: T) =>
  successResponseSchema(statsSchema);

// Tipos exportados
export type Pagination = z.infer<typeof paginationSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse<T> = z.infer<
  ReturnType<typeof successResponseSchema<z.ZodType<T>>>
>;
export type ListResponse<T> = z.infer<
  ReturnType<typeof listResponseSchema<z.ZodType<T>>>
>;
export type ItemResponse<T> = z.infer<
  ReturnType<typeof itemResponseSchema<z.ZodType<T>>>
>;
export type StatsResponse<T> = z.infer<
  ReturnType<typeof statsResponseSchema<z.ZodType<T>>>
>;
