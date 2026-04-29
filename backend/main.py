from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import proveedores, productos
import os

load_dotenv()

app = FastAPI(
    title="TUMOMITO API",
    description="Sistema de ventas para importadora TUMOMITO",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(proveedores.router)
app.include_router(productos.router)

@app.get("/")
def root():
    return {"mensaje": "TUMOMITO API funcionando", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}