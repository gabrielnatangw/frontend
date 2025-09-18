import { z } from 'zod';

// Schema para criação de usuário
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  accessType: z.enum(['ADMIN', 'USER', 'MANAGER', 'OPERATOR']),
  userType: z.enum(['ADMIN', 'STANDARD']),
  firstLogin: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

// Schema para atualização de usuário
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  accessType: z.enum(['ADMIN', 'USER', 'MANAGER', 'OPERATOR']).optional(),
  userType: z.enum(['ADMIN', 'STANDARD']).optional(),
  isActive: z.boolean().optional(),
  firstLogin: z.boolean().optional(),
});

// Schema para troca de senha
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'Nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  });

// Schema para definir nova senha
export const setPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para perfil do usuário (campos editáveis)
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
});

// Schema para edição de perfil (apenas nome, email é somente leitura)
export const editProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode exceder 100 caracteres'),
});

// Tipos inferidos dos schemas
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type SetPasswordData = z.infer<typeof setPasswordSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type EditProfileData = z.infer<typeof editProfileSchema>;
