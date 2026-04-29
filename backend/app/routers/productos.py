from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/productos", tags=["Productos"])

@router.get("/")
def listar_productos(db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        SELECT p.id, p.codigo_interno, p.nombre, p.precio_venta,
               p.precio_costo, c.nombre AS categoria, p.activo
        FROM productos p
        LEFT JOIN categorias c ON c.id = p.categoria_id
        WHERE p.activo = TRUE
        ORDER BY p.nombre
    """)).fetchall()
    return [dict(r._mapping) for r in resultado]

@router.get("/stock")
def listar_stock(db: Session = Depends(get_db)):
    resultado = db.execute(text("SELECT * FROM v_stock_total")).fetchall()
    return [dict(r._mapping) for r in resultado]

@router.get("/alertas")
def alertas_stock(db: Session = Depends(get_db)):
    resultado = db.execute(text("SELECT * FROM v_alerta_stock_bajo")).fetchall()
    return [dict(r._mapping) for r in resultado]