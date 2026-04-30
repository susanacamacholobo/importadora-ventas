from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])

@router.get("/")
def listar_proveedores(db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        SELECT 
            pv.id,
            pv.nombre,
            pv.nombre_corto,
            pv.tipo,
            pv.email,
            pv.telefono,
            pv.activo,
            COUNT(DISTINCT pp.producto_id) AS num_productos,
            COALESCE(SUM(s.cantidad * p.precio_venta), 0) AS valor_inventario
        FROM proveedores pv
        LEFT JOIN producto_proveedor pp ON pp.proveedor_id = pv.id
        LEFT JOIN productos p ON p.id = pp.producto_id AND p.activo = TRUE
        LEFT JOIN stock s ON s.producto_id = p.id
        GROUP BY pv.id, pv.nombre, pv.nombre_corto, pv.tipo, pv.email, pv.telefono, pv.activo
        ORDER BY num_productos DESC
    """)).fetchall()
    return [dict(r._mapping) for r in resultado]

@router.get("/{id}/productos")
def productos_por_proveedor(id: int, db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        SELECT 
            p.codigo_interno,
            p.nombre,
            p.precio_venta,
            COALESCE(SUM(s.cantidad), 0) AS stock_total,
            c.nombre AS categoria
        FROM productos p
        JOIN producto_proveedor pp ON pp.producto_id = p.id
        LEFT JOIN stock s ON s.producto_id = p.id
        LEFT JOIN categorias c ON c.id = p.categoria_id
        WHERE pp.proveedor_id = :id AND p.activo = TRUE
        GROUP BY p.id, p.codigo_interno, p.nombre, p.precio_venta, c.nombre
        ORDER BY stock_total DESC
    """), {"id": id}).fetchall()
    return [dict(r._mapping) for r in resultado]