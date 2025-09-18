// Utilitários para decodificar JWT

interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
  accessType: string;
  userType: string;
  iat: number;
  exp: number;
}

/**
 * Decodifica um token JWT sem verificar a assinatura
 * ATENÇÃO: Esta função apenas decodifica, não valida o token
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT tem 3 partes separadas por pontos: header.payload.signature
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.warn('Token JWT inválido: não tem 3 partes');
      return null;
    }

    // Decodificar o payload (parte do meio)
    const payload = parts[1];

    // Adicionar padding se necessário para base64url
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);

    // Decodificar base64url
    const decodedPayload = atob(
      paddedPayload.replace(/-/g, '+').replace(/_/g, '/')
    );

    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload);

    return parsedPayload as JWTPayload;
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

/**
 * Extrai o tenant ID de um token JWT
 */
export function extractTenantIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.tenantId || null;
}

/**
 * Verifica se um token JWT está expirado
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Obtém informações do token JWT
 */
export function getTokenInfo(token: string) {
  const payload = decodeJWT(token);
  if (!payload) return null;

  const now = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp < now;
  const expiresIn = payload.exp - now;

  return {
    ...payload,
    isExpired,
    expiresIn: Math.max(0, expiresIn),
    expiresAt: new Date(payload.exp * 1000),
    issuedAt: new Date(payload.iat * 1000),
  };
}
