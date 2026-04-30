from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from app.database import get_db

router = APIRouter(prefix="/clientes", tags=["Clientes"])

class ClienteCreate(BaseModel):
    nombre: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ruc_nit: Optional[str] = None
    limite_credito: Optional[float] = 0

@router.get("/")
def listar_clientes(db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        SELECT 
            c.id, c.nombre, c.email, c.telefono,
            c.direccion, c.ruc_nit, c.limite_credito,
            c.activo, c.creado_en,
            COUNT(DISTINCT pv.id) AS num_pedidos,
            COALESCE(SUM(pv.total), 0) AS total_compras
        FROM clientes c
        LEFT JOIN pedidos_venta pv ON pv.cliente_id = c.id
            AND pv.estado NOT IN ('cancelado', 'borrador')
        WHERE c.activo = TRUE
        GROUP BY c.id, c.nombre, c.email, c.telefono,
                 c.direccion, c.ruc_nit, c.limite_credito,
                 c.activo, c.creado_en
        ORDER BY total_compras DESC
    """)).fetchall()
    return [dict(r._mapping) for r in resultado]

@router.post("/")
def crear_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        INSERT INTO clientes (nombre, email, telefono, direccion, ruc_nit, limite_credito)
        VALUES (:nombre, :email, :telefono, :direccion, :ruc_nit, :limite_credito)
        RETURNING id, nombre, email, telefono, activo
    """), cliente.dict())
    db.commit()
    return dict(resultado.fetchone()._mapping)

@router.put("/{id}")
def actualizar_cliente(id: int, cliente: ClienteCreate, db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        UPDATE clientes SET
            nombre = :nombre, email = :email,
            telefono = :telefono, direccion = :direccion,
            ruc_nit = :ruc_nit, limite_credito = :limite_credito
        WHERE id = :id
        RETURNING id, nombre, email, telefono
    """), {**cliente.dict(), "id": id})
    db.commit()
    row = resultado.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return dict(row._mapping)

@router.delete("/{id}")
def desactivar_cliente(id: int, db: Session = Depends(get_db)):
    db.execute(text("UPDATE clientes SET activo = FALSE WHERE id = :id"), {"id": id})
    db.commit()
    return {"mensaje": "Cliente desactivado"}