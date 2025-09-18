import { z } from 'zod';

// Schemas básicos
export const EmailSchema = z
  .string()
  .email('Email deve estar em formato válido');
export const PasswordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres');

// Schema de Role (baseado na resposta real)
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

// Schema de Permission (baseado na resposta real)
export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

// Schema de User (baseado na resposta real da API)
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  accessType: z.enum(['ADMIN', 'USER', 'OPERATOR']),
  userType: z.enum(['STANDARD', 'PREMIUM']),
  firstLogin: z.boolean(),
  isActive: z.boolean(),
  tenantId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema de Token Response (baseado na resposta real)
export const TokenResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  firstLogin: z.boolean(),
});

// Schema de Session
export const SessionSchema = z.object({
  id: z.string(),
  device: z.string(),
  ipAddress: z.string(),
  location: z.string(),
  lastActivity: z.string(),
  isCurrent: z.boolean(),
});

// Schemas de Request
export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const LogoutRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const ForgotPasswordRequestSchema = z.object({
  email: EmailSchema,
});

export const ResetPasswordRequestSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: PasswordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

export const FirstLoginRequestSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: PasswordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

// Schemas de Response (baseados na resposta real)
export const AuthResponseSchema = TokenResponseSchema;

export const VerifyResponseSchema = z.object({
  user: UserSchema,
});

export const SessionsResponseSchema = z.object({
  sessions: z.array(SessionSchema),
  total: z.number(),
  current: z.number(),
});

export const SimpleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Tipos inferidos
export type User = z.infer<typeof UserSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type Session = z.infer<typeof SessionSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type FirstLoginRequest = z.infer<typeof FirstLoginRequestSchema>;

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;
export type SessionsResponse = z.infer<typeof SessionsResponseSchema>;
export type SimpleResponse = z.infer<typeof SimpleResponseSchema>;
