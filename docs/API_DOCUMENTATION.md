# PriceSnap API - Documentación Completa

## 📋 Índice

- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Endpoints de Usuarios](#endpoints-de-usuarios)
- [Endpoints de Productos](#endpoints-de-productos)
- [Endpoints de Competidores](#endpoints-de-competidores)
- [Endpoints de Precios](#endpoints-de-precios)
- [Endpoints de Suscripciones](#endpoints-de-suscripciones)
- [Endpoints de Scraping](#endpoints-de-scraping)
- [Códigos de Error](#códigos-de-error)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## 📖 Información General

### Base URL
```
Desarrollo: http://localhost:3000
Producción: https://api.pricesnap.com
```

### Formato de Respuesta
Todas las respuestas siguen el siguiente formato:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Códigos de Estado HTTP
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## 🔐 Autenticación

PriceSnap utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header `Authorization`:

```
Authorization: Bearer <jwt_token>
```

### Registro de Usuario

**POST** `/auth/register`

Registra un nuevo usuario en el sistema.

#### Request Body
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Juan Pérez",
  "company": "Mi Empresa S.L."
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "company": "Mi Empresa S.L.",
      "subscriptionPlan": "starter",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  },
  "message": "Usuario registrado exitosamente"
}
```

### Login de Usuario

**POST** `/auth/login`

Autentica un usuario existente.

#### Request Body
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "subscriptionPlan": "starter"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  },
  "message": "Login exitoso"
}
```

### Renovar Token

**POST** `/auth/refresh`

Renueva el token de acceso usando el refresh token.

#### Request Body
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token"
  },
  "message": "Token renovado exitosamente"
}
```

### Logout

**POST** `/auth/logout`

Invalida el token del usuario.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

## 👤 Endpoints de Usuarios

### Obtener Perfil

**GET** `/users/profile`

Obtiene el perfil del usuario autenticado.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "company": "Mi Empresa S.L.",
    "subscriptionPlan": "starter",
    "subscriptionStatus": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Actualizar Perfil

**PUT** `/users/profile`

Actualiza el perfil del usuario.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "name": "Juan Carlos Pérez",
  "company": "Mi Empresa Actualizada S.L."
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "email": "usuario@ejemplo.com",
    "name": "Juan Carlos Pérez",
    "company": "Mi Empresa Actualizada S.L.",
    "subscriptionPlan": "starter",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Perfil actualizado exitosamente"
}
```

---

## 📦 Endpoints de Productos

### Listar Productos

**GET** `/products`

Obtiene la lista de productos del usuario.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 20)
- `search` (opcional): Búsqueda por nombre

#### Response (200)
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product-uuid-1",
        "name": "Cable USB-C Premium",
        "url": "https://tienda.com/cable-usb-c",
        "sku": "USB-C-001",
        "ean": "1234567890123",
        "currentPrice": 15.99,
        "competitorsCount": 3,
        "lastScraped": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Crear Producto

**POST** `/products`

Crea un nuevo producto para seguimiento.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "name": "Cable USB-C Premium",
  "url": "https://tienda.com/cable-usb-c",
  "sku": "USB-C-001",
  "ean": "1234567890123"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "product-uuid-1",
    "name": "Cable USB-C Premium",
    "url": "https://tienda.com/cable-usb-c",
    "sku": "USB-C-001",
    "ean": "1234567890123",
    "currentPrice": null,
    "competitorsCount": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Producto creado exitosamente"
}
```

### Obtener Producto

**GET** `/products/:id`

Obtiene los detalles de un producto específico.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "product-uuid-1",
    "name": "Cable USB-C Premium",
    "url": "https://tienda.com/cable-usb-c",
    "sku": "USB-C-001",
    "ean": "1234567890123",
    "currentPrice": 15.99,
    "competitors": [
      {
        "id": "competitor-uuid-1",
        "name": "Competidor 1",
        "url": "https://competidor1.com/cable-usb-c",
        "currentPrice": 14.99,
        "lastScraped": "2024-01-15T10:30:00Z"
      }
    ],
    "priceHistory": [
      {
        "date": "2024-01-15T10:30:00Z",
        "price": 15.99,
        "competitor": "Mi Tienda"
      }
    ],
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

### Actualizar Producto

**PUT** `/products/:id`

Actualiza un producto existente.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "name": "Cable USB-C Premium Actualizado",
  "sku": "USB-C-001-V2"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "product-uuid-1",
    "name": "Cable USB-C Premium Actualizado",
    "sku": "USB-C-001-V2",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Producto actualizado exitosamente"
}
```

### Eliminar Producto

**DELETE** `/products/:id`

Elimina un producto y todos sus datos asociados.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

## 🏪 Endpoints de Competidores

### Listar Competidores

**GET** `/competitors`

Obtiene la lista de competidores del usuario.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters
- `productId` (opcional): Filtrar por producto específico

#### Response (200)
```json
{
  "success": true,
  "data": {
    "competitors": [
      {
        "id": "competitor-uuid-1",
        "name": "Competidor 1",
        "url": "https://competidor1.com/cable-usb-c",
        "productId": "product-uuid-1",
        "productName": "Cable USB-C Premium",
        "currentPrice": 14.99,
        "lastScraped": "2024-01-15T10:30:00Z",
        "status": "active"
      }
    ]
  }
}
```

### Crear Competidor

**POST** `/competitors`

Añade un nuevo competidor para un producto.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "productId": "product-uuid-1",
  "name": "Competidor 2",
  "url": "https://competidor2.com/cable-usb-c"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "competitor-uuid-2",
    "name": "Competidor 2",
    "url": "https://competidor2.com/cable-usb-c",
    "productId": "product-uuid-1",
    "currentPrice": null,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Competidor creado exitosamente"
}
```

### Actualizar Competidor

**PUT** `/competitors/:id`

Actualiza un competidor existente.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "name": "Competidor 2 Actualizado",
  "url": "https://competidor2-nuevo.com/cable-usb-c"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "competitor-uuid-2",
    "name": "Competidor 2 Actualizado",
    "url": "https://competidor2-nuevo.com/cable-usb-c",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Competidor actualizado exitosamente"
}
```

### Eliminar Competidor

**DELETE** `/competitors/:id`

Elimina un competidor.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "message": "Competidor eliminado exitosamente"
}
```

---

## 💰 Endpoints de Precios

### Historial de Precios

**GET** `/pricing/history/:productId`

Obtiene el historial de precios de un producto.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters
- `days` (opcional): Días de historial (default: 30)
- `competitorId` (opcional): Filtrar por competidor específico

#### Response (200)
```json
{
  "success": true,
  "data": {
    "productId": "product-uuid-1",
    "productName": "Cable USB-C Premium",
    "priceHistory": [
      {
        "date": "2024-01-15T10:30:00Z",
        "price": 15.99,
        "competitorId": "competitor-uuid-1",
        "competitorName": "Competidor 1",
        "url": "https://competidor1.com/cable-usb-c"
      },
      {
        "date": "2024-01-14T10:30:00Z",
        "price": 16.99,
        "competitorId": "competitor-uuid-1",
        "competitorName": "Competidor 1",
        "url": "https://competidor1.com/cable-usb-c"
      }
    ],
    "priceChanges": [
      {
        "date": "2024-01-15T10:30:00Z",
        "oldPrice": 16.99,
        "newPrice": 15.99,
        "change": -1.00,
        "changePercent": -5.88,
        "competitorName": "Competidor 1"
      }
    ]
  }
}
```

### Precios Actuales

**GET** `/pricing/current/:productId`

Obtiene los precios actuales de todos los competidores de un producto.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "productId": "product-uuid-1",
    "productName": "Cable USB-C Premium",
    "currentPrices": [
      {
        "competitorId": "competitor-uuid-1",
        "competitorName": "Competidor 1",
        "price": 14.99,
        "url": "https://competidor1.com/cable-usb-c",
        "lastScraped": "2024-01-15T10:30:00Z",
        "status": "active"
      },
      {
        "competitorId": "competitor-uuid-2",
        "competitorName": "Competidor 2",
        "price": 16.99,
        "url": "https://competidor2.com/cable-usb-c",
        "lastScraped": "2024-01-15T10:25:00Z",
        "status": "active"
      }
    ],
    "priceRange": {
      "min": 14.99,
      "max": 16.99,
      "average": 15.99
    },
    "bestPrice": {
      "competitorId": "competitor-uuid-1",
      "competitorName": "Competidor 1",
      "price": 14.99
    }
  }
}
```

### Forzar Scraping

**POST** `/pricing/scrape`

Fuerza el scraping de precios para un producto específico.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "productId": "product-uuid-1",
  "competitorIds": ["competitor-uuid-1", "competitor-uuid-2"]
}
```

#### Response (202)
```json
{
  "success": true,
  "data": {
    "jobId": "scraping-job-uuid-123",
    "status": "queued",
    "estimatedTime": "2-5 minutos"
  },
  "message": "Scraping iniciado exitosamente"
}
```

---

## 💳 Endpoints de Suscripciones

### Listar Planes

**GET** `/subscriptions/plans`

Obtiene los planes de suscripción disponibles.

#### Response (200)
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "starter",
        "name": "Startup",
        "price": 19,
        "currency": "EUR",
        "interval": "month",
        "features": {
          "productsLimit": 50,
          "competitorsLimit": 3,
          "scrapingFrequency": "daily",
          "onDemandScraping": 0,
          "emailAlerts": true,
          "priceHistory": 30
        },
        "stripePriceId": "price_starter_monthly"
      },
      {
        "id": "growth",
        "name": "Growth",
        "price": 49,
        "currency": "EUR",
        "interval": "month",
        "features": {
          "productsLimit": 150,
          "competitorsLimit": 5,
          "scrapingFrequency": "daily",
          "onDemandScraping": 1,
          "emailAlerts": true,
          "priceHistory": 90
        },
        "stripePriceId": "price_growth_monthly"
      },
      {
        "id": "pro",
        "name": "Pro",
        "price": 79,
        "currency": "EUR",
        "interval": "month",
        "features": {
          "productsLimit": 300,
          "competitorsLimit": 5,
          "scrapingFrequency": "daily",
          "onDemandScraping": 5,
          "emailAlerts": true,
          "priceHistory": 365
        },
        "stripePriceId": "price_pro_monthly"
      }
    ]
  }
}
```

### Suscripción Actual

**GET** `/subscriptions/current`

Obtiene la suscripción actual del usuario.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_uuid_123",
      "planId": "starter",
      "planName": "Startup",
      "status": "active",
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-02-01T00:00:00Z",
      "cancelAtPeriodEnd": false,
      "usage": {
        "productsUsed": 15,
        "productsLimit": 50,
        "competitorsUsed": 8,
        "competitorsLimit": 15,
        "onDemandUsed": 0,
        "onDemandLimit": 0
      }
    }
  }
}
```

### Crear Suscripción

**POST** `/subscriptions/subscribe`

Crea una nueva suscripción para el usuario.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "planId": "growth",
  "paymentMethodId": "pm_card_visa"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_uuid_456",
      "planId": "growth",
      "planName": "Growth",
      "status": "active",
      "currentPeriodStart": "2024-01-15T10:30:00Z",
      "currentPeriodEnd": "2024-02-15T10:30:00Z"
    },
    "invoice": {
      "id": "in_uuid_789",
      "amount": 49,
      "currency": "EUR",
      "status": "paid"
    }
  },
  "message": "Suscripción creada exitosamente"
}
```

### Cancelar Suscripción

**POST** `/subscriptions/cancel`

Cancela la suscripción actual del usuario.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_uuid_456",
      "status": "cancelled",
      "cancelAtPeriodEnd": true,
      "currentPeriodEnd": "2024-02-15T10:30:00Z"
    }
  },
  "message": "Suscripción cancelada exitosamente"
}
```

---

## 🕷️ Endpoints de Scraping

### Estado del Scraping

**GET** `/scraping/status`

Obtiene el estado actual del sistema de scraping.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "status": "active",
    "workers": {
      "total": 3,
      "active": 2,
      "idle": 1
    },
    "queue": {
      "pending": 15,
      "processing": 3,
      "completed": 1250,
      "failed": 12
    },
    "lastScraping": "2024-01-15T10:30:00Z",
    "nextScheduled": "2024-01-15T11:00:00Z"
  }
}
```

### Trabajos de Scraping

**GET** `/scraping/jobs`

Obtiene la lista de trabajos de scraping del usuario.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters
- `status` (opcional): Filtrar por estado (pending, processing, completed, failed)
- `page` (opcional): Número de página
- `limit` (opcional): Elementos por página

#### Response (200)
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-uuid-123",
        "productId": "product-uuid-1",
        "productName": "Cable USB-C Premium",
        "competitorId": "competitor-uuid-1",
        "competitorName": "Competidor 1",
        "status": "completed",
        "result": {
          "price": 14.99,
          "url": "https://competidor1.com/cable-usb-c",
          "scrapedAt": "2024-01-15T10:30:00Z"
        },
        "createdAt": "2024-01-15T10:25:00Z",
        "completedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## ❌ Códigos de Error

### Errores de Validación (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "El email debe ser válido"
      },
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error de Autenticación (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticación inválido o expirado"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error de Autorización (403)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para realizar esta acción"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error de Límite de Plan (403)
```json
{
  "success": false,
  "error": {
    "code": "PLAN_LIMIT_EXCEEDED",
    "message": "Has alcanzado el límite de tu plan actual",
    "details": {
      "limit": "products",
      "current": 50,
      "maximum": 50,
      "plan": "starter"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error de Recurso No Encontrado (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "El recurso solicitado no existe"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Interno del Servidor (500)
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Error interno del servidor"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📝 Ejemplos de Uso

### Flujo Completo de Uso

#### 1. Registro y Login
```bash
# Registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123",
    "name": "Juan Pérez",
    "company": "Mi Empresa S.L."
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }'
```

#### 2. Crear Producto y Competidores
```bash
# Crear producto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "name": "Cable USB-C Premium",
    "url": "https://mitienda.com/cable-usb-c",
    "sku": "USB-C-001",
    "ean": "1234567890123"
  }'

# Añadir competidor
curl -X POST http://localhost:3000/competitors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "productId": "product-uuid-1",
    "name": "Competidor 1",
    "url": "https://competidor1.com/cable-usb-c"
  }'
```

#### 3. Forzar Scraping y Ver Resultados
```bash
# Forzar scraping
curl -X POST http://localhost:3000/pricing/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "productId": "product-uuid-1"
  }'

# Ver precios actuales
curl -X GET http://localhost:3000/pricing/current/product-uuid-1 \
  -H "Authorization: Bearer <jwt_token>"

# Ver historial de precios
curl -X GET http://localhost:3000/pricing/history/product-uuid-1 \
  -H "Authorization: Bearer <jwt_token>"
```

### Ejemplos con JavaScript

```javascript
// Configuración base
const API_BASE = 'http://localhost:3000';
const token = 'your-jwt-token';

// Función helper para requests
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  });
  
  return response.json();
}

// Obtener productos
const products = await apiRequest('/products');

// Crear producto
const newProduct = await apiRequest('/products', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Nuevo Producto',
    url: 'https://ejemplo.com/producto',
    sku: 'SKU-001'
  })
});

// Forzar scraping
const scrapingJob = await apiRequest('/pricing/scrape', {
  method: 'POST',
  body: JSON.stringify({
    productId: 'product-uuid-1'
  })
});
```

### Ejemplos con Python

```python
import requests
import json

# Configuración
API_BASE = 'http://localhost:3000'
token = 'your-jwt-token'

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

# Obtener productos
response = requests.get(f'{API_BASE}/products', headers=headers)
products = response.json()

# Crear producto
product_data = {
    'name': 'Nuevo Producto',
    'url': 'https://ejemplo.com/producto',
    'sku': 'SKU-001'
}

response = requests.post(
    f'{API_BASE}/products',
    headers=headers,
    data=json.dumps(product_data)
)
new_product = response.json()

# Forzar scraping
scraping_data = {
    'productId': 'product-uuid-1'
}

response = requests.post(
    f'{API_BASE}/pricing/scrape',
    headers=headers,
    data=json.dumps(scraping_data)
)
scraping_job = response.json()
```

---

## 🔗 Enlaces Útiles

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de TypeORM](https://typeorm.io/)
- [Documentación de BullMQ](https://docs.bullmq.io/)
- [Documentación de Playwright](https://playwright.dev/)
- [Documentación de Stripe](https://stripe.com/docs)

---

*Documentación actualizada: 2024-01-15*
*Versión de API: 1.0.0*
