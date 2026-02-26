# Documentación técnica del proyecto `movilwest_app`

## 1) Propósito del documento
Este documento funciona como **bitácora técnica viva** para saber:
- Qué hace cada archivo principal.
- Qué hace cada función disponible hoy.
- Cómo está organizada la arquitectura (enfoque Clean Architecture en construcción).
- Qué revisar cuando se agreguen módulos nuevos.

---

## 2) Arquitectura actual (visión general)
El proyecto está dividido en:
- **Backend**: Flask + SQLAlchemy + PostgreSQL.
- **Frontend**: React + Vite.
- **Infraestructura local**: Docker Compose con servicios `db`, `backend`, `frontend`, `pgadmin`.

### Capas backend (estado actual)
- `backend/domain/` → **reservada** para reglas de negocio puras (actualmente vacía).
- `backend/use_case/` → **reservada** para casos de uso (actualmente vacía).
- `backend/adapters/` → **reservada** para adaptadores (API, repositorios, mapeos) (actualmente vacía).
- `backend/infrastructure/` → configuración y acceso a recursos externos (DB y modelos ORM).

> Nota: hoy existe lógica de inicialización dentro de `app.py`; la meta de Clean Architecture es mover lógica de aplicación a `use_case` y mantener `app.py` como composición/arranque.

---

## 3) Inventario por archivo

## Raíz del proyecto
- `docker-compose.yml`
  - Define y orquesta los servicios Docker:
    - `db` (PostgreSQL)
    - `backend` (Flask)
    - `frontend` (React)
    - `pgadmin` (administrador web de PostgreSQL)
- `.env`
  - Variables locales de entorno (credenciales y configuración de servicios).
  - **No debe subirse a git**.
- `.env.example`
  - Plantilla de variables para nuevos entornos/equipo.
- `.gitignore`
  - Reglas para excluir secretos, caches y artefactos temporales.
- `Comandos.txt`
  - Guía operativa rápida de comandos Docker, Git y utilidades del proyecto.
- `init.sql`
  - Reservado para scripts SQL de inicialización (actualmente vacío).

## Backend
- `backend/app.py`
  - Punto de entrada de Flask.
  - Crea aplicación, configura SQLAlchemy, inicializa DB y expone endpoint de salud.
- `backend/requirements.txt`
  - Dependencias Python del backend.
- `backend/Dockerfile`
  - Imagen del backend Flask.

### Backend / Infrastructure
- `backend/infrastructure/config.py`
  - Construye la URL de conexión a base de datos desde entorno.
- `backend/infrastructure/database.py`
  - Instancia global de SQLAlchemy (`db`).
- `backend/infrastructure/models.py`
  - Modelos ORM de tablas PostgreSQL.
- `backend/infrastructure/__init__.py`
  - Marca el paquete Python de infraestructura.

## Frontend
- `frontend/src/main.jsx`
  - Bootstrap de React, renderiza `App` en `#root`.
- `frontend/src/App.jsx`
  - Componente principal actual (plantilla Vite).
- `frontend/src/index.css`, `frontend/src/App.css`
  - Estilos globales y del componente principal.
- `frontend/Dockerfile`
  - Imagen del frontend React.
- `frontend/package.json`
  - Scripts y dependencias del frontend.
- `frontend/vite.config.js`
  - Configuración de Vite.

---

## 4) Catálogo de funciones

## Backend
### `backend/app.py`
- `create_app()`
  - **Responsabilidad**: construir y configurar la app Flask.
  - **Acciones actuales**:
    1. Instancia `Flask`.
    2. Habilita CORS.
    3. Configura `SQLALCHEMY_DATABASE_URI` con `build_database_url()`.
    4. Inicializa `db` con Flask.
    5. Ejecuta `db.create_all()` dentro del contexto de aplicación.
    6. Declara endpoint `GET /api/status`.
  - **Retorno**: instancia de aplicación Flask.

- `status()` (función interna de ruta dentro de `create_app`)
  - **Ruta**: `GET /api/status`
  - **Responsabilidad**: endpoint de verificación de estado.
  - **Retorno**: JSON con estado `ok`.

### `backend/infrastructure/config.py`
- `build_database_url() -> str`
  - **Responsabilidad**: obtener y normalizar la URL de BD desde variables de entorno.
  - **Regla**: si recibe esquema `postgres://`, lo convierte a `postgresql://` para compatibilidad con SQLAlchemy.
  - **Retorno**: cadena de conexión final.

## Frontend
### `frontend/src/App.jsx`
- `App()`
  - **Responsabilidad**: componente raíz UI actual (demo Vite/React).
  - **Estado local**: `count` con `useState`.
  - **Comportamiento**: incrementa contador al pulsar botón.

### `frontend/src/main.jsx`
- Llamada a `createRoot(...).render(...)`
  - **Responsabilidad**: montar React en el DOM y envolver `App` en `StrictMode`.

---

## 5) Catálogo de modelos ORM (tablas)
Definidos en `backend/infrastructure/models.py`:

- `Usuario` → tabla `usuarios`
  - Campos clave: `usuario_id`, `username`, `password_hash`, `rol`, `activo`.

- `Producto` → tabla `productos`
  - Campos clave: `producto_id`, `sku`, `categoria`, `marca`, `modelo`, precios y stock.
  - Relación: 1:1 con `EspecificacionTelefono`.

- `EspecificacionTelefono` → tabla `especificaciones_telefonos`
  - Clave: `producto_id` (FK de `productos`).
  - Guarda características técnicas del teléfono.

- `ChipMovilnet` → tabla `chips_movilnet`
  - Campos de inventario/venta de chips y referencia opcional a `usuarios`.

- `ControlRecarga` → tabla `control_recargas`
  - Registro de servicios y montos por usuario.

---

## 6) Flujo de ejecución (Docker)
1. `db` inicia PostgreSQL y expone puerto `5432`.
2. `backend` espera healthcheck de `db` y arranca Flask en `5000`.
3. `frontend` arranca Vite en `5173`.
4. `pgadmin` arranca en `5050` para inspección de BD.

URLs locales:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- pgAdmin: `http://localhost:5050`

---

## 7) Guía de mantenimiento de esta documentación
Cada vez que agregues o cambies código:
1. **Nuevo archivo** → añadirlo en sección “Inventario por archivo”.
2. **Nueva función** → documentarla en “Catálogo de funciones” con:
   - Responsabilidad
   - Parámetros (si aplica)
   - Retorno
   - Dependencias
3. **Nueva tabla/modelo** → actualizar “Catálogo de modelos ORM”.
4. **Cambio de infraestructura** (Docker, puertos, variables) → actualizar “Flujo de ejecución”.

Checklist rápido por PR:
- [ ] Se documentaron archivos nuevos.
- [ ] Se documentaron funciones nuevas/modificadas.
- [ ] Se actualizaron variables de entorno si cambiaron.
- [ ] Se validó que comandos de arranque siguen correctos.

---

## 8) Próximos pasos recomendados (Clean Architecture + seguridad)
- Mover lógica de negocio desde infraestructura hacia `domain` y `use_case`.
- Evitar `db.create_all()` en ambientes no dev y migrar a Alembic/Flask-Migrate.
- Definir DTOs/validaciones para entrada de datos antes de persistir.
- Añadir política de manejo de secretos (no credenciales reales en repositorio).
