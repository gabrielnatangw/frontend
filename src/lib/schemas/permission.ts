import { z } from 'zod';

// Schema para criação de permissão
export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(
      /^[a-zA-Z0-9\s\-_:]+$/,
      'Nome pode conter apenas letras, números, espaços, hífens, underscores e dois pontos'
    ),
  description: z
    .string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional(),
  module: z
    .string()
    .min(1, 'Módulo é obrigatório')
    .max(50, 'Módulo não pode exceder 50 caracteres'),
  action: z
    .string()
    .min(1, 'Ação é obrigatória')
    .max(50, 'Ação não pode exceder 50 caracteres'),
  resource: z
    .string()
    .min(1, 'Recurso é obrigatório')
    .max(50, 'Recurso não pode exceder 50 caracteres'),
});

// Schema para atualização de permissão
export const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(
      /^[a-zA-Z0-9\s\-_:]+$/,
      'Nome pode conter apenas letras, números, espaços, hífens, underscores e dois pontos'
    )
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional(),
  module: z
    .string()
    .min(1, 'Módulo é obrigatório')
    .max(50, 'Módulo não pode exceder 50 caracteres')
    .optional(),
  action: z
    .string()
    .min(1, 'Ação é obrigatória')
    .max(50, 'Ação não pode exceder 50 caracteres')
    .optional(),
  resource: z
    .string()
    .min(1, 'Recurso é obrigatório')
    .max(50, 'Recurso não pode exceder 50 caracteres')
    .optional(),
  isActive: z.boolean().optional(),
});

// Schema para filtros de permissões
export const permissionFiltersSchema = z.object({
  page: z.number().min(1, 'Página deve ser maior que 0').optional(),
  limit: z
    .number()
    .min(1, 'Limite deve ser maior que 0')
    .max(100, 'Limite máximo é 100')
    .optional(),
  name: z.string().optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

// Schema para busca de permissões
export const permissionSearchSchema = z.object({
  query: z.string().min(1, 'Consulta de busca é obrigatória'),
  module: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
});

// Tipos inferidos dos schemas
export type CreatePermissionData = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionData = z.infer<typeof updatePermissionSchema>;
export type PermissionFiltersData = z.infer<typeof permissionFiltersSchema>;
export type PermissionSearchData = z.infer<typeof permissionSearchSchema>;
