/**
 * Sistema de debug controlado
 * Permite ativar/desativar logs de debug através da variável VITE_DEBUG
 */

interface DebugOptions {
  prefix?: string;
  group?: boolean;
  collapsed?: boolean;
}

class DebugManager {
  private isEnabled: boolean;
  private prefix: string;

  constructor() {
    // Verifica se o debug está habilitado via variável de ambiente
    this.isEnabled = import.meta.env.VITE_DEBUG === 'true';
    this.prefix = '🐛';
  }

  /**
   * Log de debug geral
   */
  log(message: string, data?: any, options: DebugOptions = {}): void {
    if (!this.isEnabled) return;

    const { prefix = this.prefix, group = false, collapsed = false } = options;
    const fullMessage = `${prefix} ${message}`;

    if (group) {
      if (collapsed) {
        console.groupCollapsed(fullMessage);
      } else {
        console.group(fullMessage);
      }
      if (data !== undefined) {
        console.log(data);
      }
      console.groupEnd();
    } else {
      if (data !== undefined) {
        console.log(fullMessage, data);
      } else {
        console.log(fullMessage);
      }
    }
  }

  /**
   * Log de debug para variáveis de ambiente
   */
  env(message: string, data?: any): void {
    this.log(`🔧 ENV: ${message}`, data, { prefix: '🔧' });
  }

  /**
   * Log de debug para API
   */
  api(message: string, data?: any): void {
    this.log(`🌐 API: ${message}`, data, { prefix: '🌐' });
  }

  /**
   * Log de debug para WebSocket
   */
  ws(message: string, data?: any): void {
    this.log(`🔌 WS: ${message}`, data, { prefix: '🔌' });
  }

  /**
   * Log de debug para estado/componentes
   */
  state(message: string, data?: any): void {
    this.log(`📊 STATE: ${message}`, data, { prefix: '📊' });
  }

  /**
   * Log de debug para autenticação
   */
  auth(message: string, data?: any): void {
    this.log(`🔐 AUTH: ${message}`, data, { prefix: '🔐' });
  }

  /**
   * Log de debug para dashboard
   */
  dashboard(message: string, data?: any): void {
    this.log(`🎨 DASHBOARD: ${message}`, data, { prefix: '🎨' });
  }

  /**
   * Log de debug para sensores
   */
  sensor(message: string, data?: any): void {
    this.log(`📡 SENSOR: ${message}`, data, { prefix: '📡' });
  }

  /**
   * Log de debug para views
   */
  view(message: string, data?: any): void {
    this.log(`👁️ VIEW: ${message}`, data, { prefix: '👁️' });
  }

  /**
   * Log de debug para cards
   */
  card(message: string, data?: any): void {
    this.log(`🃏 CARD: ${message}`, data, { prefix: '🃏' });
  }

  /**
   * Log de debug para erros
   */
  error(message: string, error?: any): void {
    this.log(`❌ ERROR: ${message}`, error, { prefix: '❌' });
  }

  /**
   * Log de debug para warnings
   */
  warn(message: string, data?: any): void {
    this.log(`⚠️ WARN: ${message}`, data, { prefix: '⚠️' });
  }

  /**
   * Log de debug para sucesso
   */
  success(message: string, data?: any): void {
    this.log(`✅ SUCCESS: ${message}`, data, { prefix: '✅' });
  }

  /**
   * Log de debug para informações
   */
  info(message: string, data?: any): void {
    this.log(`ℹ️ INFO: ${message}`, data, { prefix: 'ℹ️' });
  }

  /**
   * Verifica se o debug está habilitado
   */
  isDebugEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Habilita/desabilita o debug dinamicamente
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Log de debug com grupo colapsado
   */
  group(message: string, data?: any, collapsed: boolean = true): void {
    this.log(message, data, { group: true, collapsed });
  }
}

// Instância singleton do debug manager
export const debug = new DebugManager();

// Exportar também como default para compatibilidade
export default debug;
