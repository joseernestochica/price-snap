# Docker Setup - PriceSnap API

Esta guía explica cómo configurar y usar Docker para el desarrollo del proyecto PriceSnap API.

## 🚀 Configuración Rápida

### **1. Iniciar Base de Datos**

```bash
# Iniciar solo la base de datos
docker-compose -f docker-compose.dev.yaml up -d db

# Ver logs
docker-compose -f docker-compose.dev.yaml logs -f db
```

### **2. Instalar Funciones SQL**

```bash
# Opción 1: Script automatizado (recomendado)
./scripts/install-sql-docker.sh dev

# Opción 2: Con NPM (cuando esté configurado)
npm run sql:install:docker:dev

# Opción 3: Manual
docker cp sql/install_all.sql pricesnap_dev_db:/tmp/
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -f /tmp/install_all.sql
```

### **3. Ejecutar Migraciones**

```bash
npm run migration:run
```

## 📋 Configuración Actual

### **docker-compose.dev.yaml**

```yaml
services:
  db:
    image: postgres:15-alpine
    restart: always
    ports:
      - "5434:5432"  # Puerto 5434 para evitar conflictos
    environment:
      POSTGRES_USER: pricesnap_user
      POSTGRES_PASSWORD: pricesnap_password
      POSTGRES_DB: pricesnap_dev
    container_name: pricesnap_dev_db
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
```

### **Variables de Entorno Requeridas**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_USER=pricesnap_user
DB_PASSWORD=pricesnap_password
DB_NAME=pricesnap_dev
DB_HOST=localhost
DB_PORT=5434

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_URL=redis://localhost:6380

# Para testing
TEST_DB_USER=pricesnap_user
TEST_DB_PASSWORD=pricesnap_password
TEST_DB_NAME=pricesnap_test
```

## 🐳 Comandos Docker Útiles

### **Gestión de Contenedores**

```bash
# Iniciar servicios de desarrollo
docker-compose -f docker-compose.dev.yaml up -d

# Detener servicios
docker-compose -f docker-compose.dev.yaml down

# Reiniciar base de datos
docker-compose -f docker-compose.dev.yaml restart db

# Ver estado de contenedores
docker-compose -f docker-compose.dev.yaml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yaml logs -f db
```

### **Conexión a Base de Datos**

```bash
# Conectar al contenedor
docker exec -it pricesnap_dev_db bash

# Conectar directamente a PostgreSQL
docker exec -it pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev

# Ejecutar comando SQL
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -c "SELECT version();"
```

### **Gestión de Datos**

```bash
# Crear backup
docker exec pricesnap_dev_db pg_dump -U pricesnap_user -d pricesnap_dev > backup.sql

# Restaurar backup
docker exec -i pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev < backup.sql

# Limpiar base de datos
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## 🔧 Scripts de Instalación

### **Scripts Disponibles**

```bash
# Scripts Docker (recomendados para desarrollo)
./scripts/install-sql-docker.sh          # Modo interactivo
./scripts/install-sql-docker.sh dev      # Desarrollo
./scripts/install-sql-docker.sh test     # Testing

# Scripts Windows
scripts\install-sql-docker.bat           # Modo interactivo
scripts\install-sql-docker.bat dev       # Desarrollo
scripts\install-sql-docker.bat test      # Testing
```

### **Scripts NPM (cuando estén configurados)**

```bash
# Docker
npm run sql:install:docker               # Modo interactivo
npm run sql:install:docker:dev          # Desarrollo
npm run sql:install:docker:test         # Testing

# Verificación
npm run sql:verify                       # Verificar instalación
npm run sql:verify:docker               # Verificar en Docker
```

## 🚨 Solución de Problemas

### **Error: "Contenedor no está corriendo"**

```bash
# Verificar estado
docker-compose -f docker-compose.dev.yaml ps

# Iniciar contenedor
docker-compose -f docker-compose.dev.yaml up -d db

# Ver logs para diagnosticar
docker-compose -f docker-compose.dev.yaml logs db
```

### **Error: "No se puede conectar a la base de datos"**

```bash
# Verificar que el puerto esté disponible
netstat -an | grep 5434

# Verificar variables de entorno
echo $DB_USER $DB_PASSWORD $DB_NAME

# Reiniciar contenedor
docker-compose -f docker-compose.dev.yaml restart db
```

### **Error: "Tablas no encontradas"**

```bash
# Ejecutar migraciones
npm run migration:run

# O manualmente
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -c "
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
"
```

### **Error: "Permisos insuficientes"**

```bash
# Verificar usuario de la base de datos
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -c "\du"

# Otorgar permisos
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -c "
GRANT ALL PRIVILEGES ON DATABASE pricesnap_dev TO pricesnap_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO pricesnap_user;
"
```

## 📊 Verificación de Instalación

### **Verificar Funciones Instaladas**

```bash
# Con script automatizado
./scripts/install-sql-docker.sh dev

# Manualmente
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -c "
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments
FROM pg_proc 
WHERE proname LIKE '%price%' 
OR proname LIKE '%scraping%'
OR proname LIKE '%product%'
ORDER BY proname;
"
```

### **Probar Funciones**

```bash
# Probar función principal
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -c "
SELECT insert_price_history(
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    15.99,
    'success'
);
"

# Ver logs creados
docker exec pricesnap_dev_db psql -U pricesnap_user -d pricesnap_dev -c "
SELECT * FROM price_history ORDER BY created_at DESC LIMIT 5;
"
```

## 🔄 Flujo de Desarrollo Completo

### **Primera Instalación**

```bash
# 1. Clonar proyecto
git clone tu-repositorio
cd pricesnap/api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp env.development .env
# Editar .env con tus valores

# 4. Iniciar base de datos
docker-compose -f docker-compose.dev.yaml up -d db

# 5. Esperar que esté lista
sleep 10

# 6. Ejecutar migraciones
npm run migration:run

# 7. Instalar funciones SQL
./scripts/install-sql-docker.sh dev

# 8. Verificar instalación
./scripts/install-sql-docker.sh dev

# 9. Iniciar aplicación
npm run start:dev
```

### **Reinicio Diario**

```bash
# Iniciar base de datos
docker-compose -f docker-compose.dev.yaml up -d db

# Iniciar aplicación
npm run start:dev
```

### **Reset Completo**

```bash
# Detener todo
docker-compose -f docker-compose.dev.yaml down

# Eliminar volúmenes (¡CUIDADO! Esto borra todos los datos)
docker-compose -f docker-compose.dev.yaml down -v

# Reconstruir desde cero
docker-compose -f docker-compose.dev.yaml up -d db
sleep 10
npm run migration:run
./scripts/install-sql-docker.sh dev
```

## 🌐 Servicios Adicionales

### **Redis para Cache y Colas**

```bash
# Iniciar Redis
docker-compose -f docker-compose.dev.yaml up -d redis

# Conectar a Redis
docker exec -it pricesnap_dev_redis redis-cli

# Verificar conexión
docker exec pricesnap_dev_redis redis-cli ping
```

### **Adminer para Gestión de BD**

```bash
# Iniciar Adminer
docker-compose -f docker-compose.dev.yaml up -d adminer

# Acceder a Adminer
# URL: http://localhost:8081
# Servidor: db
# Usuario: pricesnap_user
# Contraseña: pricesnap_password
# Base de datos: pricesnap_dev
```

## 📝 Notas Importantes

- **Puerto 5434**: La base de datos Docker usa el puerto 5434 para evitar conflictos
- **Puerto 6380**: Redis usa el puerto 6380 para evitar conflictos
- **Puerto 8081**: Adminer usa el puerto 8081 para evitar conflictos
- **Datos persistentes**: Los datos se guardan en volúmenes Docker
- **Variables de entorno**: Usa `.env` para configurar credenciales
- **Backups**: Crea backups antes de hacer cambios importantes
- **Logs**: Usa `docker-compose logs -f db` para ver logs en tiempo real

## 🔗 Enlaces Útiles

- [Documentación SQL completa](sql/README.md)
- [Docker Compose documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker image](https://hub.docker.com/_/postgres)
- [Redis Docker image](https://hub.docker.com/_/redis)
- [Adminer Docker image](https://hub.docker.com/_/adminer)

## 🚀 Comandos de Desarrollo Rápido

```bash
# Iniciar todo el entorno de desarrollo
docker-compose -f docker-compose.dev.yaml up -d

# Ver logs de todos los servicios
docker-compose -f docker-compose.dev.yaml logs -f

# Reiniciar solo la base de datos
docker-compose -f docker-compose.dev.yaml restart db

# Limpiar y reconstruir
docker-compose -f docker-compose.dev.yaml down -v
docker-compose -f docker-compose.dev.yaml up -d

# Ver estado de todos los contenedores
docker-compose -f docker-compose.dev.yaml ps
```

---

<p align="center">
  Desarrollado con ❤️ para PriceSnap API
</p>






