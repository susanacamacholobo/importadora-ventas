# TUMOMITO — Sistema de Ventas Digital

Sistema de ventas digital para empresas importadoras. Desarrollado con FastAPI, PostgreSQL (Supabase) y JavaScript vanilla.

## Vista general

TUMOMITO permite gestionar el ciclo completo de ventas de una importadora: desde el catálogo de productos hasta el seguimiento de pedidos, análisis de inventario y gestión de clientes y proveedores.

## Funcionalidades

- **Catálogo** — 355+ productos reales con búsqueda, filtros por categoría y proveedor, y alertas de stock crítico
- **Pedidos** — creación de pedidos con carrito, seguimiento de estados (borrador → confirmado → despachado → entregado)
- **Análisis** — gráficas de valor por categoría, top proveedores y tabla de productos con stock crítico
- **Clientes** — registro y gestión de clientes con historial de compras
- **Proveedores** — 35 proveedores reales con detalle de productos por proveedor

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS, JavaScript (ES Modules) |
| Backend | Python 3.12 + FastAPI |
| Base de datos | PostgreSQL via Supabase |
| ORM | SQLAlchemy |
| Deploy frontend | Vercel |
| Deploy backend | Railway |

## Estructura del proyecto
importadora-ventas/
├── frontend/
│   ├── index.html          # Login
│   ├── pages/
│   │   └── dashboard.html  # Sistema principal
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js          # Módulo principal
│   │   ├── productos.js    # Catálogo
│   │   ├── analisis.js     # Gráficas
│   │   ├── proveedores.js  # Proveedores
│   │   ├── clientes.js     # Clientes
│   │   └── pedidos.js      # Pedidos
│   └── assets/
└── backend/
├── main.py             # Entrada FastAPI
├── requirements.txt
├── .env.example
└── app/
├── database.py
└── routers/
├── productos.py
├── proveedores.py
├── clientes.py
├── pedidos.py
└── analisis.py

## Correr el proyecto localmente

### Requisitos
- Python 3.10+
- Node.js (para Live Server en VS Code)
- Cuenta en Supabase

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

Crea el archivo `.env` basado en `.env.example`:
DATABASE_URL=postgresql://...
SECRET_KEY=tu_secret_key

Inicia el servidor:

```bash
uvicorn main:app --reload
```

API disponible en `http://127.0.0.1:8000`
Documentación en `http://127.0.0.1:8000/docs`

### Frontend

Abre `frontend/index.html` con Live Server en VS Code.

Credenciales de prueba:
- `admin@tumomito.bo` / `admin123`
- `ventas@tumomito.bo` / `ventas123`
- `bodega@tumomito.bo` / `bodega123`

## Importar inventario

Para cargar los productos desde el Excel de inventario:

```bash
cd backend
python import_inventario.py
python asignar_categorias.py
```

## API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/productos/` | Listar productos |
| GET | `/productos/stock` | Stock por ubicación |
| GET | `/productos/alertas` | Productos bajo mínimo |
| GET | `/proveedores/` | Listar proveedores |
| GET | `/proveedores/{id}/productos` | Productos por proveedor |
| GET | `/clientes/` | Listar clientes |
| POST | `/clientes/` | Crear cliente |
| PUT | `/clientes/{id}` | Actualizar cliente |
| GET | `/pedidos/` | Listar pedidos |
| POST | `/pedidos/` | Crear pedido |
| PATCH | `/pedidos/{id}/estado` | Cambiar estado |
| GET | `/analisis/por-categoria` | Análisis por categoría |
| GET | `/analisis/por-proveedor` | Análisis por proveedor |
| GET | `/analisis/stock-critico` | Productos críticos |

## Estado del proyecto

- [x] Fase 1 — Login + estructura base
- [x] Fase 2 — Dashboard con datos reales de Supabase
- [x] Fase 3 — Backend FastAPI + importación de inventario
- [x] Fase 4 — Módulos: catálogo, pedidos, clientes, proveedores, análisis