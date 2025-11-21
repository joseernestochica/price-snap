@echo off
REM Script de instalación automática para funciones SQL con Docker - PriceSnap API
REM Uso: scripts\install-sql-docker.bat [entorno]

setlocal enabledelayedexpansion

REM Configurar colores (limitado en Windows)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM Función para mostrar ayuda
:show_help
echo Uso: %0 [ENTORNO]
echo.
echo ENTORNO:
echo   dev      - Desarrollo (docker-compose)
echo   test     - Testing
echo   prod     - Producción
echo.
echo Ejemplos:
echo   %0 dev
echo   %0 test
echo   %0 prod
echo.
echo Sin parámetros para modo interactivo:
echo   %0
goto :eof

REM Función para modo interactivo
:interactive_mode
echo %INFO% Modo interactivo - Selecciona el entorno
echo.
echo 1) Desarrollo (docker-compose)
echo 2) Testing
echo 3) Producción
echo.
set /p choice="Selecciona una opción (1-3): "

if "%choice%"=="1" set ENVIRONMENT=dev
if "%choice%"=="2" set ENVIRONMENT=test
if "%choice%"=="3" set ENVIRONMENT=prod
if not "%choice%"=="1" if not "%choice%"=="2" if not "%choice%"=="3" (
    echo %ERROR% Opción inválida
    exit /b 1
)
goto :eof

REM Función para configurar variables según entorno
:setup_environment
if "%ENVIRONMENT%"=="dev" (
    set DB_HOST=localhost
    set DB_PORT=5434
    set DB_USER=pricesnap_user
    set DB_NAME=pricesnap_dev
    set DB_PASSWORD=pricesnap_password
    set CONTAINER_NAME=pricesnap_dev_db
    echo %INFO% Configurando entorno de desarrollo con Docker
) else if "%ENVIRONMENT%"=="test" (
    set DB_HOST=localhost
    set DB_PORT=5434
    set DB_USER=pricesnap_user
    set DB_NAME=pricesnap_test
    set DB_PASSWORD=pricesnap_password
    set CONTAINER_NAME=pricesnap_test_db
    echo %INFO% Configurando entorno de testing
) else if "%ENVIRONMENT%"=="prod" (
    echo %ERROR% Para producción, configura manualmente las variables de entorno:
    echo %ERROR% DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_PASSWORD
    exit /b 1
) else (
    echo %ERROR% Entorno inválido: %ENVIRONMENT%
    exit /b 1
)
goto :eof

REM Función para verificar Docker
:check_docker
echo %INFO% Verificando Docker...

docker --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker no está instalado o no está en el PATH
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker Compose no está instalado o no está en el PATH
    exit /b 1
)

echo %SUCCESS% Docker y Docker Compose disponibles
goto :eof

REM Función para verificar si el contenedor está corriendo
:check_container
if "%ENVIRONMENT%"=="dev" (
    echo %INFO% Verificando contenedor de base de datos...
    
    docker ps | findstr "%CONTAINER_NAME%" >nul 2>&1
    if errorlevel 1 (
        echo %WARNING% El contenedor %CONTAINER_NAME% no está corriendo
        echo %INFO% Iniciando servicios con docker-compose...
        
        docker-compose -f docker-compose.dev.yaml up -d db
        if errorlevel 1 (
            echo %ERROR% Error al iniciar el contenedor
            exit /b 1
        )
        echo %SUCCESS% Contenedor iniciado correctamente
        echo %INFO% Esperando 10 segundos para que la base de datos esté lista...
        timeout /t 10 /nobreak >nul
    ) else (
        echo %SUCCESS% Contenedor %CONTAINER_NAME% está corriendo
    )
)
goto :eof

REM Función para verificar conexión
:check_connection
echo %INFO% Verificando conexión a la base de datos...

if "%ENVIRONMENT%"=="dev" (
    docker exec "%CONTAINER_NAME%" psql -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 1;" >nul 2>&1
    if errorlevel 1 (
        echo %ERROR% No se puede conectar a la base de datos en Docker
        echo %ERROR% Verifica que el contenedor esté corriendo y las credenciales sean correctas
        exit /b 1
    )
    echo %SUCCESS% Conexión exitosa a %DB_NAME% en Docker
) else (
    set PGPASSWORD=%DB_PASSWORD%
    psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 1;" >nul 2>&1
    if errorlevel 1 (
        echo %ERROR% No se puede conectar a la base de datos
        exit /b 1
    )
    echo %SUCCESS% Conexión exitosa a %DB_NAME%
)
goto :eof

REM Función para instalar funciones
:install_functions
echo %INFO% Instalando funciones SQL...

set sql_file=sql\install_all.sql

if not exist "%sql_file%" (
    echo %ERROR% Archivo %sql_file% no encontrado
    echo %ERROR% Ejecuta este script desde la raíz del proyecto
    exit /b 1
)

if "%ENVIRONMENT%"=="dev" (
    docker cp "%sql_file%" "%CONTAINER_NAME%:/tmp/install_all.sql"
    docker exec "%CONTAINER_NAME%" psql -U "%DB_USER%" -d "%DB_NAME%" -f /tmp/install_all.sql
    if errorlevel 1 (
        echo %ERROR% Error al instalar las funciones en Docker
        exit /b 1
    )
    echo %SUCCESS% Funciones instaladas correctamente en Docker
) else (
    set PGPASSWORD=%DB_PASSWORD%
    psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -f "%sql_file%"
    if errorlevel 1 (
        echo %ERROR% Error al instalar las funciones
        exit /b 1
    )
    echo %SUCCESS% Funciones instaladas correctamente
)
goto :eof

REM Función para mostrar información de uso
:show_usage_info
echo.
echo %SUCCESS% ¡Instalación completada exitosamente!
echo.
echo %INFO% Información de uso:
echo   - Entorno: %ENVIRONMENT%
echo   - Base de datos: %DB_NAME%
echo   - Usuario: %DB_USER%
echo   - Host: %DB_HOST%
echo   - Puerto: %DB_PORT%
echo.

if "%ENVIRONMENT%"=="dev" (
    echo %INFO% Para conectarte a la base de datos Docker:
    echo   docker exec -it %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME%
    echo.
    echo %INFO% Para ejecutar comandos SQL desde el host:
    echo   docker exec %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% -c "SELECT * FROM products;"
) else (
    echo %INFO% Para conectarte a la base de datos:
    echo   psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME%
)

echo.
echo %INFO% Ejemplo de uso de las funciones:
echo   SELECT insert_price_history('550e8400-e29b-41d4-a716-446655440000'::UUID, 15.99, 'success');
echo.
echo %INFO% Documentación completa en: sql\README.md
goto :eof

REM Función principal
:main
echo ==========================================
echo   Instalador SQL Docker - PriceSnap API
echo ==========================================
echo.

REM Verificar si se pasaron parámetros
if "%1"=="" (
    call :interactive_mode
) else (
    set ENVIRONMENT=%1
)

call :setup_environment
call :check_docker
call :check_container
call :check_connection
call :install_functions
call :show_usage_info

REM Ejecutar función principal
call :main %*






