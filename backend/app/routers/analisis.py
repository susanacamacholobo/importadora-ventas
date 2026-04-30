from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/analisis", tags=["Análisis"])

@router.get("/por-categoria")
def stock_por_categoria(db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        SELECT 
            c.nombre AS categoria,
            COUNT(p.id) AS num_productos,
            SUM(s.cantidad) AS stock_total,
            SUM(s.cantidad * p.precio_venta) AS valor_total,
            AVG(p.precio_venta) AS precio_promedio
        FROM productos p
        LEFT JOIN categorias c ON c.id = p.categoria_id
        LEFT JOIN stock s ON s.producto_id = p.id
        WHERE p.activo = TRUE
        GROUP BY c.nombre
        ORDER BY valor_total DESC NULLS LAST
    """)).fetchall()
    return [dict(r._mapping) for r in resultado]

@router.get("/por-proveedor")
def stock_por_proveedor(db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        SELECT 
            pv.nombre AS proveedor,
            COUNT(DISTINCT p.id) AS num_productos,
            SUM(s.cantidad) AS stock_total,
            SUM(s.cantidad * p.precio_venta) AS valor_total
        FROM proveedores pv
        JOIN producto_proveedor pp ON pp.proveedor_id = pv.id
        JOIN productos p ON p.id = pp.producto_id AND p.activo = TRUE
        LEFT JOIN stock s ON s.producto_id = p.id
        GROUP BY pv.nombre
        ORDER BY valor_total DESC NULLS LAST
        LIMIT 10
    """)).fetchall()
    return [dict(r._mapping) for r in resultado]

@router.get("/stock-critico")
def productos_stock_critico(db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        SELECT 
            p.codigo_interno,
            p.nombre,
            c.nombre AS categoria,
            pv.nombre AS proveedor,
            COALESCE(SUM(s.cantidad), 0) AS stock_total,
            p.precio_venta
        FROM productos p
        LEFT JOIN categorias c ON c.id = p.categoria_id
        LEFT JOIN producto_proveedor pp ON pp.producto_id = p.id
        LEFT JOIN proveedores pv ON pv.id = pp.proveedor_id
        LEFT JOIN stock s ON s.producto_id = p.id
        WHERE p.activo = TRUE
        GROUP BY p.id, p.codigo_interno, p.nombre, c.nombre, pv.nombre, p.precio_venta
        HAVING COALESCE(SUM(s.cantidad), 0) <= 5
        ORDER BY stock_total ASC
        LIMIT 20
    """)).fetchall()
    return [dict(r._mapping) for r in resultado]