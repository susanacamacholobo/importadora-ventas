from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])

@router.get("/")
def listar_proveedores(db: Session = Depends(get_db)):
    resultado = db.execute(text("SELECT id, nombre, nombre_corto, tipo, activo FROM proveedores ORDER BY nombre")).fetchall()
    return [dict(r._mapping) for r in resultado]

@router.get("/{id}")
def obtener_proveedor(id: int, db: Session = Depends(get_db)):
    resultado = db.execute(text("SELECT * FROM proveedores WHERE id = :id"), {"id": id}).fetchone()
    if not resultado:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return dict(resultado._mapping)