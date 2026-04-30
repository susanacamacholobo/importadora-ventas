from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

class DetallePedido(BaseModel):
    producto_id: int
    cantidad: float
    precio_unitario: float

class PedidoCreate(BaseModel):
    cliente_id: int
    observaciones: Optional[str] = None
    detalles: List[DetallePedido]

@router.get("/")
def listar_pedidos(db: Session = Depends(get_db)):
    resultado = db.execute(text("""
        SELECT 
            pv.id, pv.numero, pv.fecha, pv.estado,
            pv.total, pv.observaciones, pv.creado_en,
            c.nombre AS cliente,
            c.telefono AS cliente_telefono,
            COUNT(dpv.id) AS num_productos
        FROM pedidos_venta pv
        JOIN clientes c ON c.id = pv.cliente_id
        LEFT JOIN detalle_pedido_venta dpv ON dpv.pedido_id = pv.id
        GROUP BY pv.id, pv.numero, pv.fecha, pv.estado,
                 pv.total, pv.observaciones, pv.creado_en,
                 c.nombre, c.telefono
        ORDER BY pv.creado_en DESC
    """)).fetchall()
    return [dict(r._mapping) for r in resultado]

@router.get("/{id}")
def obtener_pedido(id: int, db: Session = Depends(get_db)):
    pedido = db.execute(text("""
        SELECT pv.*, c.nombre AS cliente, c.telefono AS cliente_telefono
        FROM pedidos_venta pv
        JOIN clientes c ON c.id = pv.cliente_id
        WHERE pv.id = :id
    """), {"id": id}).fetchone()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    detalles = db.execute(text("""
        SELECT dpv.*, p.nombre AS producto, p.codigo_interno
        FROM detalle_pedido_venta dpv
        JOIN productos p ON p.id = dpv.producto_id
        WHERE dpv.pedido_id = :id
    """), {"id": id}).fetchall()

    return {**dict(pedido._mapping), "detalles": [dict(d._mapping) for d in detalles]}

@router.post("/")
def crear_pedido(pedido: PedidoCreate, db: Session = Depends(get_db)):
    # Generar número de pedido
    count = db.execute(text("SELECT COUNT(*) FROM pedidos_venta")).scalar()
    numero = f"PV-2024-{str(count+1).zfill(4)}"

    # Calcular totales
    subtotal = sum(d.cantidad * d.precio_unitario for d in pedido.detalles)

    # Insertar pedido
    result = db.execute(text("""
        INSERT INTO pedidos_venta (numero, cliente_id, subtotal, total, observaciones)
        VALUES (:numero, :cliente_id, :subtotal, :total, :observaciones)
        RETURNING id, numero
    """), {
        "numero": numero,
        "cliente_id": pedido.cliente_id,
        "subtotal": subtotal,
        "total": subtotal,
        "observaciones": pedido.observaciones
    })
    pedido_id = result.fetchone()[0]

    # Insertar detalles
    for d in pedido.detalles:
        db.execute(text("""
            INSERT INTO detalle_pedido_venta
                (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
            VALUES (:pedido_id, :producto_id, :cantidad, :precio_unitario, :subtotal)
        """), {
            "pedido_id":       pedido_id,
            "producto_id":     d.producto_id,
            "cantidad":        d.cantidad,
            "precio_unitario": d.precio_unitario,
            "subtotal":        d.cantidad * d.precio_unitario
        })

    db.commit()
    return {"id": pedido_id, "numero": numero, "total": subtotal}

@router.patch("/{id}/estado")
def cambiar_estado(id: int, estado: str, db: Session = Depends(get_db)):
    estados_validos = ['borrador','confirmado','despachado','entregado','cancelado']
    if estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Válidos: {estados_validos}")
    db.execute(text("UPDATE pedidos_venta SET estado = :estado WHERE id = :id"), {"estado": estado, "id": id})
    db.commit()
    return {"mensaje": f"Estado actualizado a {estado}"}