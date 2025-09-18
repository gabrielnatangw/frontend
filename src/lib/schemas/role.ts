import { z } from 'zod';

// Schema para criação de role
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Nome pode conter apenas letras, números, espaços, hífens e underscores'
    ),
  description: z
    .string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional(),
  permissionIds: z
    .array(z.string().uuid('ID de permissão inválido'))
    .min(1, 'Pelo menos uma permissão deve ser selecionada'),
});

// Schema para atualização de role
export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Nome pode conter apenas letras, números, espaços, hífens e underscores'
    )
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional(),
  permissionIds: z
    .array(z.string().uuid('ID de permissão inválido'))
    .min(1, 'Pelo menos uma permissão deve ser selecionada')
    .optional(),
  isActive: z.boolean().optional(),
});

// Schema para duplicação de role
export const duplicateRoleSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Nome pode conter apenas letras, números, espaços, hífens e underscores'
    ),
});

// Schema para atribuição de permissões
export const assignPermissionsSchema = z.object({
  permissionIds: z
    .array(z.string().uuid('ID de permissão inválido'))
    .min(1, 'Pelo menos uma permissão deve ser selecionada'),
});

// Schema para filtros de roles
export const roleFiltersSchema = z.object({
  page: z.number().min(1, 'Página deve ser maior que 0').optional(),
  limit: z
    .number()
    .min(1, 'Limite deve ser maior que 0')
    .max(100, 'Limite máximo é 100')
    .optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  search: z.string().optional(),
});

// Tipos inferidos dos schemas
export type CreateRoleData = z.infer<typeof createRoleSchema>;
export type UpdateRoleData = z.infer<typeof updateRoleSchema>;
export type DuplicateRoleData = z.infer<typeof duplicateRoleSchema>;
export type AssignPermissionsData = z.infer<typeof assignPermissionsSchema>;
export type RoleFiltersData = z.infer<typeof roleFiltersSchema>;
