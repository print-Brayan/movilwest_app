# Documentación técnica del proyecto `movilwest_app`

## 1) Propósito
Este documento es una guía viva para entender:
- la estructura actual del proyecto,
- la responsabilidad de cada módulo,
- las funciones/rutas principales,
- y cómo mantener la documentación alineada con el código.

---

## 2) Estado actual de arquitectura
El proyecto usa una arquitectura inspirada en Clean Architecture con estas capas en backend:

- `backend/adapters/`: endpoints HTTP y middleware de autenticación.
- `backend/use_case/`: reglas de negocio de usuarios, productos, login y recargas.
- `backend/infrastructure/`: base de datos, modelos ORM, configuración y repositorios.
- `backend/domain/`: reservado para entidades/reglas de dominio puras (actualmente sin implementación explícita separada).

Frontend:
- React + React Router + Tailwind-like utility classes.
- Vistas principales: Login, Inventario, Recargas, AgregarProducto.

---

## 3) Inventario de archivos (actualizado)

## Raíz
- `docker-compose.yml`
  - Servicios: `db`, `backend`, `frontend`, `pgadmin`.
- `.env`, `.env.example`
  - Variables de entorno del stack.
- `.gitignore`
  - Exclusión de secretos/cachés/artefactos locales.
- `Comandos.txt`
  - Ayuda operativa de comandos.
- `DOCUMENTACION_PROYECTO.md`
  - Este documento.

## Backend
- `backend/app.py`
  - Inicializa Flask, CORS, SQLAlchemy, blueprints y endpoint de status.
  - Expone `GET /uploads/<filename>` para servir imágenes guardadas.

### Adapters (`backend/adapters`)
- `auth_middleware.py`
  - Decorador `token_requerido` para validar JWT en rutas protegidas.
- `usuario_routes.py`
  - `POST /api/usuarios/registro`
  - `POST /api/usuarios/login`
- `producto_routes.py`
  - `POST /api/productos/nuevo`
  - `GET /api/productos/`
  - `DELETE /api/productos/<id>`
  - `POST /api/productos/vender/<id>`
- `recarga_routes.py`
  - `POST /api/recargas/nueva`
  - `GET /api/recargas/hoy`

### Use cases (`backend/use_case`)
- `usuario_use_cases.py` → `RegistrarUsuarioUseCase`
- `login_use_case.py` → `LoginUseCase`
- `producto_use_cases.py` → `RegistrarProductoUseCase`, `ObtenerProductosUseCase`, `EliminarProductoUseCase`, `VenderProductoUseCase`
- `recarga_use_cases.py` → `RegistrarRecargaUseCase`, `ObtenerRecargasHoyUseCase`

### Infrastructure (`backend/infrastructure`)
- `config.py` → `build_database_url()`
- `database.py` → instancia global `db`
- `models.py` → tablas ORM
- `repositories/usuario_repository.py` → `UsuarioRepository`
- `repositories/producto_repository.py` → `ProductoRepository`
- `repositories/recarga_repository.py` → `RecargaRepository`

### Carpeta de archivos subidos
- `backend/uploads/`
  - Almacena imágenes de productos.

## Frontend
- `frontend/src/main.jsx`
  - Entry point de React.
- `frontend/src/App.jsx`
  - Define rutas:
    - `/login`
    - `/inventario`
    - `/recargas`
    - `/agregar-producto`
- `frontend/src/components/Login.jsx`
  - Form de login + guardado de token.
- `frontend/src/components/Inventario.jsx`
  - Tabla de inventario con:
    - búsqueda en tiempo real,
    - venta con modal y cantidad,
    - duplicar producto,
    - eliminar producto,
    - vista ampliada de foto,
    - mensaje de éxito y manejo de error.
- `frontend/src/components/Recargas.jsx`
  - Registro de recarga + historial del día + resumen financiero.
- `frontend/src/components/AgregarProducto.jsx`
  - Registro de producto nuevo y flujo de duplicación con precarga.

---

## 4) Funciones/rutas clave

## Backend
### `backend/app.py`
- `create_app()`
  - Configura app, DB, CORS, blueprints y rutas base.
- `status()`
  - `GET /api/status`.
- `uploaded_file(filename)`
  - `GET /uploads/<filename>`.

### `backend/adapters/producto_routes.py`
- `allowed_file(filename)`
  - Valida extensión de imagen permitida.
- `registrar_producto(usuario_actual)`
  - Registra producto con foto nueva o conserva `foto_url` existente (duplicación).
- `obtener_inventario(usuario_actual)`
  - Devuelve lista de productos.
- `eliminar_producto(usuario_actual, id)`
  - Elimina producto por ID (rol ADMIN).
- `vender_producto(usuario_actual, id)`
  - Descarga stock y registra impacto financiero.

### `backend/adapters/recarga_routes.py`
- `registrar_recarga(usuario_actual)`
  - Guarda recarga y retorna ganancia neta.
- `obtener_recargas_hoy(usuario_actual)`
  - Devuelve recargas del día.

### `backend/adapters/usuario_routes.py`
- `registrar_usuario()`
  - Alta de usuario con hash de contraseña.
- `login_usuario()`
  - Login + emisión de JWT.

### `backend/adapters/auth_middleware.py`
- `token_requerido(f)`
  - Extrae y valida JWT desde header `Authorization: Bearer ...`.

## Frontend
### `Inventario.jsx`
- `cargarProductos()`
  - Consulta inventario autenticado.
- `ejecutarVenta()`
  - Envía cantidad de venta al backend, refresca tabla y muestra notificación.
- `manejarEliminar(id)`
  - Elimina producto y recarga listado.
- `productosFiltrados` (estado derivado)
  - Filtra por SKU, marca o modelo.

### `AgregarProducto.jsx`
- `manejarCambioFoto(e)`
  - Gestiona foto nueva + preview.
- `enviarFormulario(e)`
  - Envía `FormData` con datos del producto.
  - Si no hay foto nueva pero hay duplicación, envía `foto_url` existente.

### `Recargas.jsx`
- `cargarHistorial()`
  - Carga recargas del día.
- `manejarRegistro(e)`
  - Registra nueva recarga y actualiza resumen/historial.

### `Login.jsx`
- `manejarLogin(e)`
  - Autentica usuario y guarda token en `localStorage`.

---

## 5) Modelo de datos (ORM)
Definido en `backend/infrastructure/models.py`:

- `Usuario` → `usuarios`
- `Producto` → `productos`
- `EspecificacionTelefono` → `especificaciones_telefonos`
- `ChipMovilnet` → `chips_movilnet`
- `ControlRecarga` → `control_recargas`

Notas:
- `Producto` incluye `foto_url` para miniatura/imagen ampliada en frontend.
- `ControlRecarga` se usa tanto para recargas como para trazabilidad financiera de ventas.

---

## 6) Flujo de ejecución local (Docker)
1. `db` inicia PostgreSQL (`5432`).
2. `backend` arranca Flask (`5000`) y crea tablas si no existen.
3. `frontend` arranca Vite (`5173`).
4. `pgadmin` arranca en `5050`.

URLs:
- API: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- pgAdmin: `http://localhost:5050`

---

## 7) Seguridad y decisiones actuales
- Autenticación JWT en endpoints sensibles (`token_requerido`).
- Passwords con `bcrypt` (no texto plano).
- `secure_filename` para nombres de archivo en uploads.
- Separación por capas (`adapters` / `use_case` / `infrastructure`).

Pendientes recomendados:
- Retirar `print` de depuración en `producto_routes.py`.
- Mover secretos por defecto (`JWT_SECRET`) a entorno obligatorio.
- Migrar de `db.create_all()` a migraciones (Alembic/Flask-Migrate).

---

## 8) Guía de mantenimiento de esta documentación
Al abrir un PR o completar una funcionalidad:
- [ ] Actualizar inventario de archivos nuevos.
- [ ] Registrar nuevas rutas/endpoints.
- [ ] Registrar nuevos casos de uso/repositorios.
- [ ] Documentar cambios de UX en componentes.
- [ ] Validar que secciones de seguridad sigan vigentes.
