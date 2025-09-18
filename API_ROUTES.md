# Lousa — API Routes Documentation

## Cabeçalho

- **Nome da função:** `Backend API - Sistema de Monitoramento IoT`
- **Descrição curta:** API completa para sistema de monitoramento de sensores, usuários, permissões e help center
- **Base URL:** `http://localhost:3000/api`
- **Auth:** `Authorization: Bearer {{token}}`
- **Content-Type padrão:** `application/json; charset=utf-8`

---

## Rotas

### 1) Autenticação — `/api/auth`

#### POST — Login

- **Method:** `POST`
- **URL:** `/auth/login`
- **Headers**

  | Header       | Valor              |
  | ------------ | ------------------ |
  | Content-Type | `application/json` |

- **Body (modelo)**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **cURL**

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

- **Respostas**
  - [x] `200 OK` – login com sucesso
  - [x] `401` – credenciais inválidas
  - [x] `500` – erro interno

#### POST — Refresh Token

- **Method:** `POST`
- **URL:** `/auth/refresh`
- **Headers**

  | Header       | Valor              |
  | ------------ | ------------------ |
  | Content-Type | `application/json` |

- **Body (modelo)**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **cURL**

```bash
curl -X POST "http://localhost:3000/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

- **Respostas**
  - [x] `200 OK` – token renovado
  - [x] `401` – token inválido
  - [x] `500` – erro interno

---

### 2) Usuários — `/api/users`

#### GET — Listar Usuários

- **Method:** `GET`
- **URL:** `/users`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **Query params (opc.)**

  | Param    | Tipo   | Exemplo | Obs       |
  | -------- | ------ | ------- | --------- |
  | `page`   | int    | `1`     | paginação |
  | `limit`  | int    | `50`    | 1–100     |
  | `search` | string | `joão`  | filtro    |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=50" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de usuários
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### GET — Detalhar Usuário

- **Method:** `GET`
- **URL:** `/users/{id}`
- **Headers:** iguais ao GET listar
- **Path params**

  | Param | Tipo | Exemplo                                |
  | ----- | ---- | -------------------------------------- |
  | `id`  | uuid | `d43ee0fb-0c67-42ef-b505-f57207255dfb` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/users/d43ee0fb-0c67-42ef-b505-f57207255dfb" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK`
  - [x] `404 Not Found`
  - [x] `401/403`
  - [x] `500`

#### POST — Criar Usuário

- **Method:** `POST`
- **URL:** `/users`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Content-Type  | `application/json` |

- **Body (modelo)**

```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",
  "userType": "user",
  "isActive": true
}
```

- **cURL**

```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@exemplo.com", "password": "senha123", "userType": "user", "isActive": true}'
```

- **Respostas**
  - [x] `201 Created`
  - [x] `400 Bad Request`
  - [x] `409 Conflict`
  - [x] `401/403`
  - [x] `500`

#### PUT — Atualizar Usuário

- **Method:** `PUT`
- **URL:** `/users/{id}`
- **Headers:** iguais ao POST
- **Path params:** `id`
- **Body (modelo)**

```json
{
  "name": "João Silva Atualizado",
  "email": "joao.novo@exemplo.com",
  "userType": "admin",
  "isActive": true
}
```

- **cURL**

```bash
curl -X PUT "http://localhost:3000/api/users/d43ee0fb-0c67-42ef-b505-f57207255dfb" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva Atualizado", "email": "joao.novo@exemplo.com", "userType": "admin", "isActive": true}'
```

- **Respostas**
  - [x] `200 OK`
  - [x] `400`
  - [x] `404`
  - [x] `409`
  - [x] `401/403`
  - [x] `500`

#### DELETE — Remover Usuário

- **Method:** `DELETE`
- **URL:** `/users/{id}`
- **Headers:** iguais ao GET
- **Path params:** `id`
- **cURL**

```bash
curl -X DELETE "http://localhost:3000/api/users/d43ee0fb-0c67-42ef-b505-f57207255dfb" \
  -H "Authorization: Bearer {{token}}"
```

- **Respostas**
  - [x] `204 No Content`
  - [x] `404`
  - [x] `409`
  - [x] `401/403`
  - [x] `500`

#### GET — Meu Perfil

- **Method:** `GET`
- **URL:** `/users/profile/me`
- **Headers:** iguais ao GET listar
- **cURL**

```bash
curl -X GET "http://localhost:3000/api/users/profile/me" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – dados do perfil
  - [x] `401` – não autenticado
  - [x] `500` – erro interno

#### PUT — Atualizar Meu Perfil

- **Method:** `PUT`
- **URL:** `/users/profile/me`
- **Headers:** iguais ao POST
- **Body (modelo)**

```json
{
  "name": "Meu Nome Atualizado",
  "email": "meu.email@exemplo.com"
}
```

- **cURL**

```bash
curl -X PUT "http://localhost:3000/api/users/profile/me" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Meu Nome Atualizado", "email": "meu.email@exemplo.com"}'
```

- **Respostas**
  - [x] `200 OK`
  - [x] `400`
  - [x] `401`
  - [x] `500`

#### PATCH — Alterar Senha

- **Method:** `PATCH`
- **URL:** `/users/profile/change-password`
- **Headers:** iguais ao POST
- **Body (modelo)**

```json
{
  "currentPassword": "senhaAtual123",
  "newPassword": "novaSenha456"
}
```

- **cURL**

```bash
curl -X PATCH "http://localhost:3000/api/users/profile/change-password" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "senhaAtual123", "newPassword": "novaSenha456"}'
```

- **Respostas**
  - [x] `200 OK`
  - [x] `400`
  - [x] `401`
  - [x] `500`

---

### 3) Roles — `/api/roles`

#### GET — Listar Roles

- **Method:** `GET`
- **URL:** `/roles`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **Query params (opc.)**

  | Param   | Tipo | Exemplo | Obs       |
  | ------- | ---- | ------- | --------- |
  | `page`  | int  | `1`     | paginação |
  | `limit` | int  | `50`    | 1–100     |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/roles?page=1&limit=50" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de roles
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### GET — Detalhar Role

- **Method:** `GET`
- **URL:** `/roles/{id}`
- **Headers:** iguais ao GET listar
- **Path params**

  | Param | Tipo | Exemplo                                |
  | ----- | ---- | -------------------------------------- |
  | `id`  | uuid | `f8456a63-09c9-45d3-8a13-5604c8bf3d1d` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/roles/f8456a63-09c9-45d3-8a13-5604c8bf3d1d" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK`
  - [x] `404 Not Found`
  - [x] `401/403`
  - [x] `500`

#### POST — Criar Role

- **Method:** `POST`
- **URL:** `/roles`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Content-Type  | `application/json` |

- **Body (modelo)**

```json
{
  "name": "Administrador",
  "description": "Acesso total ao sistema",
  "isActive": true,
  "permissionIds": ["perm1", "perm2"]
}
```

- **cURL**

```bash
curl -X POST "http://localhost:3000/api/roles" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Administrador", "description": "Acesso total ao sistema", "isActive": true, "permissionIds": ["perm1", "perm2"]}'
```

- **Respostas**
  - [x] `201 Created`
  - [x] `400 Bad Request`
  - [x] `409 Conflict`
  - [x] `401/403`
  - [x] `500`

#### PUT — Atualizar Role

- **Method:** `PUT`
- **URL:** `/roles/{id}`
- **Headers:** iguais ao POST
- **Path params:** `id`
- **Body (modelo)**

```json
{
  "name": "Administrador Atualizado",
  "description": "Acesso total ao sistema atualizado",
  "isActive": true
}
```

- **cURL**

```bash
curl -X PUT "http://localhost:3000/api/roles/f8456a63-09c9-45d3-8a13-5604c8bf3d1d" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Administrador Atualizado", "description": "Acesso total ao sistema atualizado", "isActive": true}'
```

- **Respostas**
  - [x] `200 OK`
  - [x] `400`
  - [x] `404`
  - [x] `409`
  - [x] `401/403`
  - [x] `500`

#### DELETE — Remover Role

- **Method:** `DELETE`
- **URL:** `/roles/{id}`
- **Headers:** iguais ao GET
- **Path params:** `id`
- **cURL**

```bash
curl -X DELETE "http://localhost:3000/api/roles/f8456a63-09c9-45d3-8a13-5604c8bf3d1d" \
  -H "Authorization: Bearer {{token}}"
```

- **Respostas**
  - [x] `204 No Content`
  - [x] `404`
  - [x] `409`
  - [x] `401/403`
  - [x] `500`

---

### 4) Permissões — `/api/permissions`

#### GET — Listar Permissões

- **Method:** `GET`
- **URL:** `/permissions`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **Query params (opc.)**

  | Param           | Tipo | Exemplo                                | Obs                  |
  | --------------- | ---- | -------------------------------------- | -------------------- |
  | `applicationId` | uuid | `4624d115-b617-41a8-ad07-166935b830d0` | filtro por aplicação |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/permissions?applicationId=4624d115-b617-41a8-ad07-166935b830d0" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de permissões
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### GET — Permissões por Tenant

- **Method:** `GET`
- **URL:** `/permissions/tenant`
- **Headers:** iguais ao GET listar
- **cURL**

```bash
curl -X GET "http://localhost:3000/api/permissions/tenant" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – permissões do tenant
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

---

### 5) Aplicações — `/api/applications`

#### GET — Listar Aplicações

- **Method:** `GET`
- **URL:** `/applications`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/applications" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de aplicações
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### GET — Detalhar Aplicação

- **Method:** `GET`
- **URL:** `/applications/{id}`
- **Headers:** iguais ao GET listar
- **Path params**

  | Param | Tipo | Exemplo                                |
  | ----- | ---- | -------------------------------------- |
  | `id`  | uuid | `4624d115-b617-41a8-ad07-166935b830d0` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/applications/4624d115-b617-41a8-ad07-166935b830d0" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK`
  - [x] `404 Not Found`
  - [x] `401/403`
  - [x] `500`

---

### 6) Sensores — `/api/sensors`

#### GET — Listar Sensores

- **Method:** `GET`
- **URL:** `/sensors`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **Query params (opc.)**

  | Param   | Tipo   | Exemplo  | Obs       |
  | ------- | ------ | -------- | --------- |
  | `page`  | int    | `1`      | paginação |
  | `limit` | int    | `50`     | 1–100     |
  | `type`  | string | `analog` | filtro    |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/sensors?page=1&limit=50&type=analog" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de sensores
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### GET — Detalhar Sensor

- **Method:** `GET`
- **URL:** `/sensors/{id}`
- **Headers:** iguais ao GET listar
- **Path params**

  | Param | Tipo | Exemplo            |
  | ----- | ---- | ------------------ |
  | `id`  | uuid | `sensor-uuid-here` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/sensors/sensor-uuid-here" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK`
  - [x] `404 Not Found`
  - [x] `401/403`
  - [x] `500`

#### POST — Criar Sensor

- **Method:** `POST`
- **URL:** `/sensors`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Content-Type  | `application/json` |

- **Body (modelo)**

```json
{
  "name": "Sensor de Temperatura",
  "type": "analog",
  "unit": "°C",
  "minValue": 0,
  "maxValue": 100,
  "machineId": "machine-uuid-here"
}
```

- **cURL**

```bash
curl -X POST "http://localhost:3000/api/sensors" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Sensor de Temperatura", "type": "analog", "unit": "°C", "minValue": 0, "maxValue": 100, "machineId": "machine-uuid-here"}'
```

- **Respostas**
  - [x] `201 Created`
  - [x] `400 Bad Request`
  - [x] `409 Conflict`
  - [x] `401/403`
  - [x] `500`

---

### 7) Módulos — `/api/modules`

#### GET — Listar Módulos

- **Method:** `GET`
- **URL:** `/modules`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **Query params (opc.)**

  | Param    | Tipo   | Exemplo  | Obs       |
  | -------- | ------ | -------- | --------- |
  | `page`   | int    | `1`      | paginação |
  | `limit`  | int    | `50`     | 1–100     |
  | `search` | string | `módulo` | filtro    |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/modules?page=1&limit=50&search=módulo" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de módulos
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### POST — Criar Módulo

- **Method:** `POST`
- **URL:** `/modules`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Content-Type  | `application/json` |

- **Body (modelo)**

```json
{
  "customer": "Cliente ABC",
  "country": "Brasil",
  "city": "São Paulo",
  "blueprint": "Planta A",
  "sector": "Produção",
  "machineName": "Máquina Principal",
  "machineId": "machine-uuid-here"
}
```

- **cURL**

```bash
curl -X POST "http://localhost:3000/api/modules" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"customer": "Cliente ABC", "country": "Brasil", "city": "São Paulo", "blueprint": "Planta A", "sector": "Produção", "machineName": "Máquina Principal", "machineId": "machine-uuid-here"}'
```

- **Respostas**
  - [x] `201 Created`
  - [x] `400 Bad Request`
  - [x] `409 Conflict`
  - [x] `401/403`
  - [x] `500`

---

### 8) Máquinas — `/api/machines`

#### GET — Listar Máquinas

- **Method:** `GET`
- **URL:** `/machines`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **Query params (opc.)**

  | Param   | Tipo | Exemplo | Obs       |
  | ------- | ---- | ------- | --------- |
  | `page`  | int  | `1`     | paginação |
  | `limit` | int  | `50`    | 1–100     |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/machines?page=1&limit=50" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de máquinas
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### GET — Detalhar Máquina

- **Method:** `GET`
- **URL:** `/machines/{id}`
- **Headers:** iguais ao GET listar
- **Path params**

  | Param | Tipo | Exemplo             |
  | ----- | ---- | ------------------- |
  | `id`  | uuid | `machine-uuid-here` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/machines/machine-uuid-here" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK`
  - [x] `404 Not Found`
  - [x] `401/403`
  - [x] `500`

---

### 9) Help Center — `/api/help-center`

#### GET — Listar Temas

- **Method:** `GET`
- **URL:** `/help-center/themes`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/help-center/themes" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de temas
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### GET — Listar Vídeos

- **Method:** `GET`
- **URL:** `/help-center/videos`
- **Headers:** iguais ao GET temas
- **Query params (opc.)**

  | Param      | Tipo   | Exemplo    | Obs    |
  | ---------- | ------ | ---------- | ------ |
  | `platform` | string | `youtube`  | filtro |
  | `search`   | string | `tutorial` | busca  |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/help-center/videos?platform=youtube&search=tutorial" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de vídeos
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### POST — Criar Busca

- **Method:** `POST`
- **URL:** `/help-center/searches`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Content-Type  | `application/json` |

- **Body (modelo)**

```json
{
  "query": "como configurar sensor",
  "userId": "user-uuid-here"
}
```

- **cURL**

```bash
curl -X POST "http://localhost:3000/api/help-center/searches" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{"query": "como configurar sensor", "userId": "user-uuid-here"}'
```

- **Respostas**
  - [x] `201 Created`
  - [x] `400 Bad Request`
  - [x] `401/403`
  - [x] `500`

---

### 10) Views — `/api/views`

#### GET — Listar Views

- **Method:** `GET`
- **URL:** `/views`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **Query params (opc.)**

  | Param   | Tipo | Exemplo | Obs       |
  | ------- | ---- | ------- | --------- |
  | `page`  | int  | `1`     | paginação |
  | `limit` | int  | `50`    | 1–100     |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/views?page=1&limit=50" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – lista de views
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

#### GET — Detalhar View

- **Method:** `GET`
- **URL:** `/views/{id}`
- **Headers:** iguais ao GET listar
- **Path params**

  | Param | Tipo | Exemplo          |
  | ----- | ---- | ---------------- |
  | `id`  | uuid | `view-uuid-here` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/views/view-uuid-here" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK`
  - [x] `404 Not Found`
  - [x] `401/403`
  - [x] `500`

---

### 11) MQTT — `/api/mqtt`

#### GET — Status MQTT

- **Method:** `GET`
- **URL:** `/mqtt/status`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/mqtt/status" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – status do MQTT
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

---

### 12) Socket — `/api/socket`

#### GET — Status Socket

- **Method:** `GET`
- **URL:** `/socket/status`
- **Headers**

  | Header        | Valor              |
  | ------------- | ------------------ |
  | Authorization | Bearer `{{token}}` |
  | Accept        | `application/json` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/socket/status" \
  -H "Authorization: Bearer {{token}}" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – status do Socket
  - [x] `401`/`403` – auth
  - [x] `500` – erro interno

---

### 13) Health Check — `/api/health`

#### GET — Status da API

- **Method:** `GET`
- **URL:** `/health`
- **Headers**

  | Header | Valor              |
  | ------ | ------------------ |
  | Accept | `application/json` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/health" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – API funcionando
  - [x] `500` – erro interno

---

### 14) Swagger — `/api/docs`

#### GET — Documentação da API

- **Method:** `GET`
- **URL:** `/docs`
- **Headers**

  | Header | Valor       |
  | ------ | ----------- |
  | Accept | `text/html` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/docs" \
  -H "Accept: text/html"
```

- **Respostas**
  - [x] `200 OK` – Interface Swagger UI
  - [x] `500` – erro interno

#### GET — Especificação OpenAPI

- **Method:** `GET`
- **URL:** `/docs.json`
- **Headers**

  | Header | Valor              |
  | ------ | ------------------ |
  | Accept | `application/json` |

- **cURL**

```bash
curl -X GET "http://localhost:3000/api/docs.json" \
  -H "Accept: application/json"
```

- **Respostas**
  - [x] `200 OK` – Especificação OpenAPI em JSON
  - [x] `500` – erro interno

---

## Esquemas

- **Objeto User (response)**

```json
{
  "id": "d43ee0fb-0c67-42ef-b505-f57207255dfb",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "userType": "user",
  "firstLogin": false,
  "isActive": true,
  "tenantId": "tenant-uuid-here",
  "createdAt": "2025-01-01T12:00:00Z",
  "updatedAt": "2025-01-02T12:00:00Z",
  "deletedAt": null
}
```

- **Objeto Role (response)**

```json
{
  "id": "f8456a63-09c9-45d3-8a13-5604c8bf3d1d",
  "name": "Administrador",
  "description": "Acesso total ao sistema",
  "isActive": true,
  "tenantId": "tenant-uuid-here",
  "createdAt": "2025-01-01T12:00:00Z",
  "updatedAt": "2025-01-02T12:00:00Z",
  "deletedAt": null
}
```

- **Objeto Sensor (response)**

```json
{
  "id": "sensor-uuid-here",
  "name": "Sensor de Temperatura",
  "type": "analog",
  "unit": "°C",
  "minValue": 0,
  "maxValue": 100,
  "machineId": "machine-uuid-here",
  "tenantId": "tenant-uuid-here",
  "createdAt": "2025-01-01T12:00:00Z",
  "updatedAt": "2025-01-02T12:00:00Z"
}
```

- **Objeto Application (response)**

```json
{
  "id": "4624d115-b617-41a8-ad07-166935b830d0",
  "name": "Sistema de Monitoramento",
  "description": "Sistema principal de monitoramento IoT",
  "isActive": true,
  "tenantId": "tenant-uuid-here",
  "createdAt": "2025-01-01T12:00:00Z",
  "updatedAt": "2025-01-02T12:00:00Z"
}
```

- **Erro (response)**

```json
{
  "success": false,
  "message": "Erro na operação",
  "error": "VALIDATION_ERROR",
  "fields": {
    "email": "Email inválido"
  }
}
```

- **Sucesso (response)**

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {
    "id": "uuid-here",
    "name": "Nome do item"
  }
}
```

---

## Testes rápidos

- [x] Happy path POST → 201
- [x] GET listar com paginação
- [x] GET detalhar → 200/404
- [x] PUT total → 200/204
- [x] PATCH parcial → 200/204
- [x] DELETE → 204/404
- [x] Autenticação JWT
- [x] Validação de permissões
- [x] Filtros e busca
- [x] Paginação
- [x] Tratamento de erros

## Notas

- **Autenticação**: Todas as rotas (exceto `/health` e `/docs`) requerem token JWT válido
- **Permissões**: Sistema de permissões baseado em roles e funções
- **Tenant**: Isolamento de dados por tenant (multi-tenancy)
- **Paginação**: Suporte a paginação com `page` e `limit`
- **Filtros**: Suporte a filtros e busca em várias rotas
- **Validação**: Validação robusta de dados de entrada
- **Logs**: Sistema completo de logs e auditoria
- **MQTT**: Integração com MQTT para dados de sensores em tempo real
- **Socket.IO**: Comunicação em tempo real via WebSocket
- **Swagger**: Documentação interativa disponível em `/api/docs`
- **Help Center**: Sistema completo de ajuda e suporte
- **Soft Delete**: Exclusão lógica para preservar dados históricos
