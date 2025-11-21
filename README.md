# PriceSnap API - Backend

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  <strong>Micro-App de análisis de precios de la competencia para Pymes de e-commerce</strong>
</p>

<p align="center">
  <a href="#descripción">Descripción</a> •
  <a href="#características">Características</a> •
  <a href="#instalación">Instalación</a> •
  <a href="#configuración">Configuración</a> •
  <a href="#desarrollo">Desarrollo</a> •
  <a href="#api">API</a> •
  <a href="#despliegue">Despliegue</a>
</p>

---

## 📋 Descripción

PriceSnap es una aplicación SaaS diseñada para ayudar a las Pymes de e-commerce a monitorear y analizar los precios de sus competidores en tiempo real. Especialmente enfocada en el nicho de accesorios de tecnología y componentes electrónicos.

### 🎯 Objetivo del Proyecto

- **Problema**: Las Pymes pierden ventas por estar mal posicionadas en precio
- **Solución**: Herramienta simple y económica para análisis de precios de competencia
- **Nicho**: Accesorios de tecnología y componentes electrónicos
- **Modelo**: SaaS con planes de suscripción ($19-$79/mes)

## 🚀 Características Principales

### Core Features
- ✅ **Autenticación JWT** - Sistema seguro de usuarios
- ✅ **Gestión de Productos** - CRUD completo con URLs y metadatos
- ✅ **Configuración de Competidores** - Hasta 5 competidores por producto
- ✅ **Sistema de Scraping** - Extracción automática de precios con Playwright
- ✅ **Dashboard de Precios** - Visualización con semáforo de alertas
- ✅ **Historial de Precios** - Seguimiento de 30 días con gráficas
- ✅ **Sistema de Alertas** - Notificaciones por email para cambios de precio
- ✅ **Planes de Suscripción** - Integración con Stripe
- ✅ **Límites por Plan** - Control de uso según suscripción

### Tecnologías Utilizadas
- **Backend**: NestJS + TypeScript
- **Base de Datos**: PostgreSQL + Redis
- **Colas**: BullMQ para procesamiento asíncrono
- **Scraping**: Playwright para extracción de datos
- **Autenticación**: JWT con Passport
- **Pagos**: Stripe para suscripciones
- **Validación**: class-validator + class-transformer

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18.x
- PostgreSQL >= 13.x
- Redis >= 6.x
- Yarn o npm

### Instalación Rápida

```bash
# Clonar el repositorio
git clone <repository-url>
cd api

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
yarn run migration:run

# Iniciar en modo desarrollo
yarn run start:dev
```

### Instalación con Docker

```bash
# Usar Docker Compose para desarrollo
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

## ⚙️ Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura las siguientes variables:

```env
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/pricesnap
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Scraping
SCRAPING_USER_AGENT=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
PROXY_ROTATION_ENABLED=false

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### Configuración de Base de Datos

```bash
# Crear base de datos
createdb pricesnap

# Ejecutar migraciones
yarn run migration:run

# Poblar con datos de prueba (opcional)
yarn run seed:run
```

## 🛠️ Desarrollo

### Estructura del Proyecto

```
src/
├── auth/                 # Módulo de autenticación
├── users/                # Módulo de usuarios
├── products/             # Módulo de productos
├── competitors/          # Módulo de competidores
├── scraping/             # Módulo de scraping
├── queues/               # Módulo de colas (BullMQ)
├── subscriptions/        # Módulo de suscripciones
├── pricing/              # Módulo de precios
├── common/               # Utilidades comunes
│   ├── decorators/       # Decoradores personalizados
│   ├── guards/           # Guards de autenticación
│   ├── interceptors/      # Interceptors
│   └── pipes/            # Pipes de validación
└── main.ts               # Punto de entrada
```

### Scripts Disponibles

```bash
# Desarrollo
yarn run start:dev        # Modo desarrollo con hot reload
yarn run start:debug      # Modo debug

# Producción
yarn run build            # Compilar para producción
yarn run start:prod      # Ejecutar en producción

# Testing
yarn run test             # Tests unitarios
yarn run test:e2e         # Tests end-to-end
yarn run test:cov         # Coverage de tests

# Base de Datos
yarn run migration:generate # Generar migración
yarn run migration:run     # Ejecutar migraciones
yarn run migration:revert  # Revertir migración
yarn run seed:run          # Ejecutar seeds

# Linting y Formato
yarn run lint             # Ejecutar ESLint
yarn run format           # Formatear código con Prettier
```

### Convenciones de Código

- **Módulos**: Un módulo por funcionalidad
- **DTOs**: Usar DTOs para validación de entrada
- **Guards**: Proteger rutas con guards
- **Interceptors**: Usar interceptors para logging y transformación
- **Decoradores**: Crear decoradores personalizados cuando sea necesario

## 📚 API

### Endpoints Principales

#### Autenticación
```http
POST /auth/register     # Registro de usuario
POST /auth/login        # Login de usuario
POST /auth/refresh      # Renovar token
POST /auth/logout       # Logout
```

#### Productos
```http
GET    /products        # Listar productos del usuario
POST   /products        # Crear producto
GET    /products/:id    # Obtener producto
PUT    /products/:id    # Actualizar producto
DELETE /products/:id    # Eliminar producto
```

#### Competidores
```http
GET    /competitors     # Listar competidores
POST   /competitors     # Crear competidor
PUT    /competitors/:id # Actualizar competidor
DELETE /competitors/:id # Eliminar competidor
```

#### Precios
```http
GET /pricing/history/:productId  # Historial de precios
GET /pricing/current/:productId  # Precios actuales
POST /pricing/scrape              # Forzar scraping
```

#### Suscripciones
```http
GET  /subscriptions/plans         # Listar planes disponibles
POST /subscriptions/subscribe     # Suscribirse a plan
GET  /subscriptions/current       # Plan actual del usuario
POST /subscriptions/cancel        # Cancelar suscripción
```

### Documentación de API Completa

Para ver la documentación completa de la API con ejemplos de requests/responses, consulta [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md).

## 🚀 Despliegue

### Despliegue con Docker

```bash
# Construir imagen
docker build -t pricesnap-api .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env pricesnap-api
```

### Despliegue en Producción

1. **Configurar servidor**
   ```bash
   # Instalar Node.js y dependencias
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Configurar base de datos**
   ```bash
   # PostgreSQL gestionado o instalación local
   # Redis gestionado o instalación local
   ```

3. **Variables de entorno de producción**
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   JWT_SECRET=production-secret-key
   ```

4. **Desplegar aplicación**
   ```bash
   yarn run build
   yarn run start:prod
   ```

### Monitoreo

- **Logs**: Usar Winston para logging estructurado
- **Métricas**: Implementar métricas con Prometheus
- **Alertas**: Configurar alertas para errores críticos
- **Backup**: Backup automático de base de datos

## 📊 Planes de Suscripción

| Plan    | Precio  | Productos | Competidores | Actualizaciones |
| ------- | ------- | --------- | ------------ | --------------- |
| Startup | $19/mes | 50        | 3            | Diarias         |
| Growth  | $49/mes | 150       | 5            | 1 bajo demanda  |
| Pro     | $79/mes | 300       | 5            | 5 bajo demanda  |

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**
   ```bash
   # Verificar que PostgreSQL esté corriendo
   sudo systemctl status postgresql
   
   # Verificar conexión
   psql -h localhost -U user -d pricesnap
   ```

2. **Error de conexión a Redis**
   ```bash
   # Verificar que Redis esté corriendo
   redis-cli ping
   ```

3. **Problemas de scraping**
   ```bash
   # Verificar logs de workers
   yarn run logs:scraping
   
   # Reiniciar workers
   yarn run restart:workers
   ```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- **Email**: support@pricesnap.com
- **Documentación**: [docs.pricesnap.com](https://docs.pricesnap.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/pricesnap-api/issues)

---

<p align="center">
  Desarrollado con ❤️ para ayudar a las Pymes a competir mejor
</p>