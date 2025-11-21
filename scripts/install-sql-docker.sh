#!/bin/bash

# Script de instalación automática para funciones SQL con Docker - PriceSnap API
# Uso: ./scripts/install-sql-docker.sh [entorno]

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [ENTORNO]"
    echo ""
    echo "ENTORNO:"
    echo "  dev      - Desarrollo (docker-compose)"
    echo "  test     - Testing"
    echo "  prod     - Producción"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev"
    echo "  $0 test"
    echo "  $0 prod"
    echo ""
    echo "Sin parámetros para modo interactivo:"
    echo "  $0"
}

# Función para modo interactivo
interactive_mode() {
    print_message "Modo interactivo - Selecciona el entorno"
    echo ""
    
    echo "1) Desarrollo (docker-compose)"
    echo "2) Testing"
    echo "3) Producción"
    echo ""
    read -p "Selecciona una opción (1-3): " choice
    
    case $choice in
        1) ENVIRONMENT="dev" ;;
        2) ENVIRONMENT="test" ;;
        3) ENVIRONMENT="prod" ;;
        *) print_error "Opción inválida"; exit 1 ;;
    esac
}

# Función para configurar variables según entorno
setup_environment() {
    case $ENVIRONMENT in
        "dev")
            DB_HOST="localhost"
            DB_PORT="5434"
            DB_USER="${DB_USER:-pricesnap_user}"
            DB_NAME="${DB_NAME:-pricesnap_dev}"
            DB_PASSWORD="${DB_PASSWORD:-pricesnap_password}"
            CONTAINER_NAME="pricesnap_dev_db"
            print_message "Configurando entorno de desarrollo con Docker"
            ;;
        "test")
            DB_HOST="localhost"
            DB_PORT="5434"
            DB_USER="${TEST_DB_USER:-pricesnap_user}"
            DB_NAME="${TEST_DB_NAME:-pricesnap_test}"
            DB_PASSWORD="${TEST_DB_PASSWORD:-pricesnap_password}"
            CONTAINER_NAME="pricesnap_test_db"
            print_message "Configurando entorno de testing"
            ;;
        "prod")
            print_error "Para producción, configura manualmente las variables de entorno:"
            print_error "DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_PASSWORD"
            exit 1
            ;;
        *)
            print_error "Entorno inválido: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

# Función para verificar Docker
check_docker() {
    print_message "Verificando Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado o no está en el PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado o no está en el PATH"
        exit 1
    fi
    
    print_success "Docker y Docker Compose disponibles"
}

# Función para verificar si el contenedor está corriendo
check_container() {
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        print_message "Verificando contenedor de base de datos..."
        
        if ! docker ps | grep -q "$CONTAINER_NAME"; then
            print_warning "El contenedor $CONTAINER_NAME no está corriendo"
            print_message "Iniciando servicios con docker-compose..."
            
            if docker-compose -f docker-compose.dev.yaml up -d db; then
                print_success "Contenedor iniciado correctamente"
                print_message "Esperando 10 segundos para que la base de datos esté lista..."
                sleep 10
            else
                print_error "Error al iniciar el contenedor"
                exit 1
            fi
        else
            print_success "Contenedor $CONTAINER_NAME está corriendo"
        fi
    fi
}

# Función para verificar conexión
check_connection() {
    print_message "Verificando conexión a la base de datos..."
    
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        # Usar docker exec para conectar al contenedor
        if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "Conexión exitosa a $DB_NAME en Docker"
        else
            print_error "No se puede conectar a la base de datos en Docker"
            print_error "Verifica que el contenedor esté corriendo y las credenciales sean correctas"
            exit 1
        fi
    else
        # Para otros entornos, usar conexión directa
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            print_success "Conexión exitosa a $DB_NAME"
        else
            print_error "No se puede conectar a la base de datos"
            exit 1
        fi
    fi
}

# Función para verificar tablas requeridas
check_required_tables() {
    print_message "Verificando tablas requeridas..."
    
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        local tables_exist=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_name IN ('users', 'products', 'competitors', 'price_history')
            AND table_schema = 'public';
        " | tr -d ' ')
    else
        local tables_exist=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_name IN ('users', 'products', 'competitors', 'price_history')
            AND table_schema = 'public';
        " | tr -d ' ')
    fi
    
    if [[ "$tables_exist" == "4" ]]; then
        print_success "Tablas requeridas encontradas"
    else
        print_warning "Tablas requeridas no encontradas ($tables_exist/4)"
        print_warning "Asegúrate de haber ejecutado las migraciones de TypeORM primero"
        
        if [[ "$ENVIRONMENT" == "dev" ]]; then
            print_message "Para ejecutar migraciones en Docker:"
            print_message "npm run migration:run"
        fi
        
        read -p "¿Continuar de todas formas? (y/N): " continue_install
        if [[ ! "$continue_install" =~ ^[Yy]$ ]]; then
            print_message "Instalación cancelada"
            exit 0
        fi
    fi
}

# Función para instalar funciones
install_functions() {
    print_message "Instalando funciones SQL..."
    
    local sql_file="sql/install_all.sql"
    
    if [[ ! -f "$sql_file" ]]; then
        print_error "Archivo $sql_file no encontrado"
        print_error "Ejecuta este script desde la raíz del proyecto"
        exit 1
    fi
    
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        # Copiar archivo al contenedor y ejecutar
        docker cp "$sql_file" "$CONTAINER_NAME:/tmp/install_all.sql"
        
        if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/install_all.sql; then
            print_success "Funciones instaladas correctamente en Docker"
        else
            print_error "Error al instalar las funciones en Docker"
            exit 1
        fi
    else
        # Para otros entornos, conexión directa
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$sql_file"; then
            print_success "Funciones instaladas correctamente"
        else
            print_error "Error al instalar las funciones"
            exit 1
        fi
    fi
}

# Función para verificar instalación
verify_installation() {
    print_message "Verificando instalación..."
    
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        local functions_count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "
            SELECT COUNT(*) FROM pg_proc 
            WHERE proname LIKE '%price%' 
            OR proname LIKE '%scraping%'
            OR proname LIKE '%product%';
        " | tr -d ' ')
    else
        local functions_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
            SELECT COUNT(*) FROM pg_proc 
            WHERE proname LIKE '%price%' 
            OR proname LIKE '%scraping%'
            OR proname LIKE '%product%';
        " | tr -d ' ')
    fi
    
    if [[ "$functions_count" -gt 0 ]]; then
        print_success "Se instalaron $functions_count funciones correctamente"
        
        # Mostrar funciones instaladas
        echo ""
        print_message "Funciones instaladas:"
        if [[ "$ENVIRONMENT" == "dev" ]]; then
            docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
                SELECT 
                    proname AS function_name,
                    pg_get_function_identity_arguments(oid) AS arguments
                FROM pg_proc 
                WHERE proname LIKE '%price%' 
                OR proname LIKE '%scraping%'
                OR proname LIKE '%product%'
                ORDER BY proname;
            "
        else
            PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
                SELECT 
                    proname AS function_name,
                    pg_get_function_identity_arguments(oid) AS arguments
                FROM pg_proc 
                WHERE proname LIKE '%price%' 
                OR proname LIKE '%scraping%'
                OR proname LIKE '%product%'
                ORDER BY proname;
            "
        fi
    else
        print_error "No se encontraron funciones instaladas"
        exit 1
    fi
}

# Función para mostrar información de uso
show_usage_info() {
    echo ""
    print_success "¡Instalación completada exitosamente!"
    echo ""
    print_message "Información de uso:"
    echo "  - Entorno: $ENVIRONMENT"
    echo "  - Base de datos: $DB_NAME"
    echo "  - Usuario: $DB_USER"
    echo "  - Host: $DB_HOST"
    echo "  - Puerto: $DB_PORT"
    echo ""
    
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        print_message "Para conectarte a la base de datos Docker:"
        echo "  docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME"
        echo ""
        print_message "Para ejecutar comandos SQL desde el host:"
        echo "  docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \"SELECT * FROM products;\""
    else
        print_message "Para conectarte a la base de datos:"
        echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    fi
    
    echo ""
    print_message "Ejemplo de uso de las funciones:"
    echo "  SELECT insert_price_history('550e8400-e29b-41d4-a716-446655440000'::UUID, 15.99, 'success');"
    echo ""
    print_message "Documentación completa en: sql/README.md"
}

# Función principal
main() {
    echo "=========================================="
    echo "  Instalador SQL Docker - PriceSnap API"
    echo "=========================================="
    echo ""
    
    # Verificar si se pasaron parámetros
    if [[ $# -eq 0 ]]; then
        interactive_mode
    else
        ENVIRONMENT="$1"
    fi
    
    setup_environment
    check_docker
    check_container
    check_connection
    check_required_tables
    install_functions
    verify_installation
    show_usage_info
}

# Ejecutar función principal
main "$@"
