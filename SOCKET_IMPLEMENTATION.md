# 🔌 Implementação do Socket.IO - Documentação Técnica

## 📋 Visão Geral

Este documento explica como o Socket.IO está implementado no projeto, incluindo configurações para diferentes ambientes (desenvolvimento, staging e produção).

## 🏗️ Arquitetura do Socket

### Componentes Principais

1. **Hooks de Socket** - Gerenciam conexões e estado
2. **Configurações de Ambiente** - URLs e parâmetros por ambiente
3. **Autenticação** - JWT + Tenant ID
4. **Processamento de Dados** - Parsers para diferentes formatos

## 🌐 Configuração por Ambiente

### Desenvolvimento, Staging e Produção



## 🔧 Implementação Técnica

### 1. Hook Principal: `useRealtimeSensors`

**Localização:** `src/pages/p-trace/Ptrace-teste.tsx`

```typescript
function useRealtimeSensors(opts: UseRealtimeSensorsOpts = {}) {
  const {
    sensorIds = [],
    debug = false,
  } = opts;
```

**Funcionalidades:**

- Conecta ao servidor Socket.IO
- Processa dados de sensores em tempo real
- Gerencia reconexão automática
- Suporte a múltiplos formatos de dados (MQTT, WebSocket)

### 2. URL Fixa

```typescript
// URL fixa para testes locais
const socketUrl = 'http://127.0.0.1:3001';
```

**Configuração:**

- **URL:** `http://127.0.0.1:3001/sensor`
- **Namespace:** `/sensor`
- **Sem processamento dinâmico de URL**

### 3. Configuração do Socket.IO

```typescript
const s = io(`${socketUrl}/sensor`, {
  auth: { token, tenantId },
  transports: ['polling', 'websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  extraHeaders: { 'X-Tenant-ID': tenantId },
});
```

## 🔐 Autenticação

### Dados Necessários

- **JWT Token** - Obtido do localStorage (`auth-storage`)
- **Tenant ID** - Identificador do tenant do usuário

### Implementação

```typescript
function getAuthData() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      return {
        token: authData?.state?.accessToken || '',
        tenantId: authData?.state?.user?.tenantId || '',
        user: authData?.state?.user || null,
      };
    }
  } catch (error) {
    console.error('Erro ao parsear auth-storage:', error);
  }

  return {
    token: localStorage.getItem('accessToken') || '',
    tenantId: localStorage.getItem('tenantId') || '',
    user: null,
  };
}
```

## 📊 Processamento de Dados

### Formatos Suportados

#### 1. MQTT Relay (Backend)

```javascript
// Formato: ["tenantId", [v,s,t,"id"], [v,s,t,"id"], ...]
const payload = [
  'tenant-uuid-here',
  [25.5, 0, 50, 'sensor-1'],
  [true, 0, 1, 'sensor-2'],
];
```

#### 2. WebSocket Pair List

```javascript
// Formato: [["id", [v,s,t,"id"]], ...]
const payload = [
  ['sensor-1', [25.5, 0, 50, 'sensor-1']],
  ['sensor-2', [true, 0, 1, 'sensor-2']],
];
```

### Parser Automático

```typescript
const parseIncoming = React.useCallback(
  (data: any) => {
    if (!data) return {};
    const timestamp = data.timestamp || new Date().toISOString();
    const payloadStr =
      typeof data.payload === 'string'
        ? data.payload
        : JSON.stringify(data.payload);

    try {
      const first = JSON.parse(payloadStr)[0];

      // Caso pair-list: primeiro é array
      if (Array.isArray(first)) {
        return parsePairListPayload(payloadStr, timestamp);
      }

      // Caso MQTT relay: primeiro é string (tenantId)
      if (typeof first === 'string') {
        return parseMqttRelayPayload(payloadStr, timestamp);
      }

      return parseMqttRelayPayload(payloadStr, timestamp);
    } catch {
      return {};
    }
  },
  [debug, parseMqttRelayPayload, parsePairListPayload]
);
```

## 🔄 Gerenciamento de Estado

### Estados do Socket

```typescript
const [isConnected, setIsConnected] = React.useState(false);
const [error, setError] = React.useState<string | null>(null);
const [sensorData, setSensorData] = React.useState<SensorMap>({});
const [sensorHistory, setSensorHistory] =
  React.useState <
  Record<
    string,
    Array<{
      timestamp: number;
      value: number;
      status: number;
    }>
  >({});
```

### Eventos do Socket

```typescript
s.on('connect', () => {
  setIsConnected(true);
  setError(null);
  if (debug) console.log('✅ Conectado:', s.id);

  // Assinatura opcional (filtrar no servidor)
  if (sensorIds.length > 0) {
    s.emit('sensors:subscribe', { sensorIds });
  } else {
    s.emit('sensors:request-current', { sensorIds: [] });
  }
});

s.on('disconnect', reason => {
  setIsConnected(false);
  if (debug) console.log('❌ Desconectado:', reason);
});

s.on('connect_error', (err: any) => {
  setIsConnected(false);
  setError(err?.message || 'Erro de conexão');
  if (debug) console.error('❌ connect_error:', err);
});

s.on('sensor-data', (data: any) => {
  const parsed = parseIncoming(data);
  setSensorData(prev => ({ ...prev, ...parsed }));
});
```

## 🚀 Deploy e Configuração

### Cloud Build (cloudbuild.yaml)

#### Staging

```yaml
env:
  - 'VITE_APP_ENV=staging'
  - 'VITE_API_URL=https://smart-platform.io:8443/api-v2'
```

#### Produção

```yaml
env:
  - 'VITE_APP_ENV=production'
  - 'VITE_API_URL=https://smart-platform.io:8443/api-backend'
```

### Scripts de Deploy

#### deploy-staging.sh

```bash
--set-env-vars VITE_APP_ENV=staging,VITE_API_URL=https://smart-platform.io:8443/api-v2
```

#### deploy-production.sh

```bash
--set-env-vars VITE_APP_ENV=production,VITE_API_URL=https://smart-platform.io:8443/api-backend
```

## 🔍 Debug e Monitoramento

### Logs de Debug

```typescript
if (debug) {
  console.log('🔧 Configuração WebSocket:', {
    token: token ? `${token.substring(0, 20)}...` : 'VAZIO',
    tenantId: tenantId || 'VAZIO',
    url,
    namespace,
    sensorIds,
  });
}
```

### Debug do localStorage

```typescript
console.log('🔍 localStorage debug:', {
  authStorage: localStorage.getItem('auth-storage') ? 'EXISTE' : 'NÃO EXISTE',
  accessToken: localStorage.getItem('accessToken') ? 'EXISTE' : 'NÃO EXISTE',
  tenantId: localStorage.getItem('tenantId') ? 'EXISTE' : 'NÃO EXISTE',
  allKeys: Object.keys(localStorage),
});
```

## 🛠️ Hooks Auxiliares

### 1. `use-websocket-sensor-data.ts`

- Conexão simples com autenticação JWT
- Processamento básico de dados de sensores

### 2. `use-websocket-sensor-data-real.ts`

- Conexão com namespace específico
- Rastreamento de erros detalhado

### 3. `use-socket-io.ts`

- Hook genérico para Socket.IO
- Configurações flexíveis

## ⚠️ Problemas Conhecidos e Soluções

### 1. Erro "Invalid namespace"

**Problema:** Namespace `/sensor` não reconhecido pelo servidor
**Solução:** Remover namespace específico, conectar sem namespace

### 2. URL duplicada

**Problema:** `https://smart-platform.io:8443/api-backend/api-backend/socket.io/`
**Solução:** Corrigir lógica de processamento da URL

### 3. Erro de CORS

**Problema:** New Relic causando erros de CORS
**Solução:** Remover completamente o New Relic

## 📈 Performance

### Otimizações Implementadas

- **Reconexão automática** com backoff exponencial
- **Filtros de sensores** para reduzir processamento
- **Histórico limitado** (50 pontos por sensor)
- **Parsers otimizados** com callbacks memoizados

### Métricas

- **Timeout de conexão:** 10 segundos
- **Tentativas de reconexão:** 5 (staging) / 10 (produção)
- **Intervalo de reconexão:** 1-5 segundos
- **Heartbeat:** 25-30 segundos

## 🔧 Manutenção

### Adicionar Novo Ambiente

1. Adicionar variáveis no `cloudbuild.yaml`
2. Atualizar scripts de deploy
3. Testar conexão

### Debug de Problemas

1. Verificar logs do console
2. Validar variáveis de ambiente
3. Testar conexão manual com exemplo Node.js
4. Verificar autenticação (JWT + Tenant ID)

## 📚 Exemplos de Uso

### Conexão Manual (Node.js)

```javascript
const io = require('socket.io-client');

const socket = io('https://smart-platform.io:8443', {
  path: '/api-backend/socket.io/',
  transports: ['polling', 'websocket'],
  autoConnect: true,
  timeout: 10000,
});

socket.on('connect', () => {
  console.log('Conectado!', socket.id);
});
```

### Teste de Conexão

```typescript
// Ativar debug
const realtimeState = useRealtimeSensors({
  sensorIds: ['sensor-1', 'sensor-2'],
  debug: true,
});
```

---

**Última atualização:** $(date)
**Versão:** 1.0.0
**Autor:** Equipe de Desenvolvimento
