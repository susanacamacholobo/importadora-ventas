import psycopg2
from dotenv import load_dotenv
import os
import re

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

match = re.match(r'postgresql://(.+):(.+)@(.+):(\d+)/(.+)\?', DATABASE_URL)
if not match:
    match = re.match(r'postgresql://(.+):(.+)@(.+):(\d+)/(.+)', DATABASE_URL)

user, password, host, port, dbname = match.groups()

conn = psycopg2.connect(
    host=host, port=port, dbname=dbname,
    user=user, password=password, sslmode='require'
)
cur = conn.cursor()
print("Conectado a Supabase!")

# Obtener IDs de categorías
cur.execute("SELECT id, nombre FROM categorias")
cats = {nombre: id for id, nombre in cur.fetchall()}
print(f"Categorías disponibles: {list(cats.keys())}")

# Reglas de asignación por palabras clave en el nombre
REGLAS = [
    # Velas y Aromatizadores
    (['VELA', 'VELITA', 'TEALIGHT', 'PILAR', 'VOTIVA',
      'AROMA', 'AROMATIZADOR', 'INFUSOR', 'SACHET', 'INCIENSO'],
     cats.get('Velas y Aromatizadores')),

    # Textiles de Baño
    (['TOALLA', 'ALFOMBRA BAÑO', 'PISO BAÑO', 'ALBORNOZ',
      'CORTINA BAÑO', 'ATELIER'],
     cats.get('Textiles de Baño')),

    # Marcos y Espejos
    (['MARCO', 'ESPEJO', 'CUADRO', 'FOTO'],
     cats.get('Marcos y Espejos')),

    # Cortinas y Stores
    (['CORTINA', 'STORE', 'BLACKOUT', 'VISILLO', 'VOLADO'],
     cats.get('Cortinas y Stores')),

    # Canastos y Organizadores
    (['CANASTO', 'ORGANIZADOR', 'CESTO', 'BOLSILLO',
      'BANDEJA', 'PORTA', 'FRASCO', 'TARRO'],
     cats.get('Canastos y Organizadores')),

    # Decoración del Hogar
    (['LAMPARA', 'LÁMPARA', 'BOMBILLO', 'BOMBILLA', 'LED',
      'FAROL', 'GUIRNALDA', 'LUCES', 'COLGANTE', 'EDISON',
      'FLORERO', 'MACETA', 'PLANTA', 'COJIN', 'COJÍN',
      'MANTEL', 'ALMOHADON', 'VELVET', 'CORONA', 'FLORES',
      'SAQUITO', 'NAVIDAD', 'PASCUA', 'CONEJO', 'DECORACION',
      'DECORACIÓN', 'PARCHE', 'STICKER AZULEJO', 'PIZARRA',
      'TIMBRE', 'CAMPANA', 'VINTAGE', 'RUSTIC', 'DECO',
      'FIGURA', 'ESTATUA', 'ADORNO', 'CUELGA', 'ESPIRAL'],
     cats.get('Decoración del Hogar')),

    # Papelería y Agendas
    (['LAPIZ', 'LÁPIZ', 'LAPICERO', 'BOLIGRAFO', 'BOLÍGRAFO',
      'GEL RETRAC', 'MARCADOR', 'RESALTADOR', 'PLUMA',
      'AGENDA', 'CUADERNO', 'BLOCK', 'LIBRETA', 'NOTA',
      'STICKER', 'ADHESIV', 'SELLO', 'TINTA',
      'BILLETERA PAPEL', 'CARPETA', 'SOBRE', 'ELAST',
      'CLIP', 'CHINCHETA', 'CANDADO', 'ETIQUETA',
      'SEPARADOR', 'PORTAFOLIO', 'PINES', 'PINS'],
     cats.get('Papelería y Agendas')),

    # Juguetes - Bloques
    (['BLOQUE', 'PUZZLE', 'ROMPECABEZA', 'CONSTRUCCION',
      'CONSTRUCCIÓN', 'LEGO', 'ARMABLE'],
     cats.get('Bloques y Construcción')),

    # Juguetes - Muñecas
    (['MUÑECA', 'MUÑECO', 'DOLL', 'BEBE JUGUETE',
      'FASHION DOLL', 'BARBACOA'],
     cats.get('Muñecas y Accesorios')),

    # Juguetes - Juegos
    (['JUEGO', 'JUGUETE', 'PISTA AUTO', 'MILITAR',
      'PISTOLA', 'LANZA AGUA', 'ESCUDO CAPITAN',
      'CAMION DIY', 'TELEFONO JUGUETE', 'COCINA JUGUETE',
      'HERRAMIENTA JUGUETE', 'BURBUJA', 'YO-YO', 'YOYO',
      'TELAR', 'CORONA FLORES SET'],
     cats.get('Juegos de Mesa')),

    # Cosméticos
    (['PERFUME', 'FRAGANCIA', 'COLONIA', 'DESODORANTE',
      'MANICURE', 'LIMA', 'CORTAUÑA', 'COSMETIQUERO',
      'MAQUILLAJE', 'CREMA', 'LABIAL', 'RIMEL',
      'GUATERO', 'CALENTADOR MANOS'],
     cats.get('Cosméticos y Cuidado Personal')),

    # Relojes y Accesorios
    (['RELOJ', 'SMARTWATCH', 'CRONOMETRO'],
     cats.get('Relojes y Accesorios')),

    # Electrónica
    (['AUDIFONO', 'AURICULAR', 'SPLITTER', 'CARGADOR',
      'USB', 'CABLE DATOS', 'PARLANTE', 'SPEAKER',
      'POWER BANK', 'LED TIRA'],
     cats.get('Electrónica y Tecnología')),

    # Ropa y Textiles
    (['CALCETIN', 'CALCETÍN', 'ZAPATO', 'ZAPATILLA',
      'FUNDA PLUMON', 'SABANA', 'SÁBANA', 'FUNDA COJIN',
      'ROPA MUÑECA', 'SET ROPA', 'BUFANDA', 'GORRO'],
     cats.get('Ropa y Textiles')),

    # Bolsos y Mochilas → Varios
    (['MOCHILA', 'BOLSO', 'BOLSA COMPRAS', 'MALETA',
      'MARCADOR MALETA', 'BOLSA HERMETICA'],
     cats.get('Varios')),

    # Cocina → Varios
    (['VASO', 'TAZA', 'MUG', 'COPA', 'RAMEKIN', 'BOWL',
      'PLATO', 'CUBIERTO', 'TERMO', 'TETERA', 'CAFETERA',
      'HIELER', 'MOLINILLO', 'REVOLVEDORE', 'PALITO',
      'CORTADOR GALLETA', 'CANOA MADERA'],
     cats.get('Varios')),

    # Baño personal → Varios  
    (['JABON', 'JABÓN', 'DISPENSADOR JABON', 'COTONITO',
      'PETALO', 'LENTE CONTACTO', 'PORTA LENTE',
      'SET LIMA', 'MINI SET MANICURE'],
     cats.get('Varios')),
]

# Obtener todos los productos
cur.execute("SELECT id, nombre FROM productos WHERE activo = TRUE")
productos = cur.fetchall()
print(f"\nAsignando categorías a {len(productos)} productos...")

actualizados = 0
sin_categoria = 0

for prod_id, nombre in productos:
    nombre_upper = nombre.upper()
    categoria_id = None

    for palabras, cat_id in REGLAS:
        if cat_id and any(p in nombre_upper for p in palabras):
            categoria_id = cat_id
            break

    if categoria_id:
        cur.execute(
            "UPDATE productos SET categoria_id = %s WHERE id = %s",
            (categoria_id, prod_id)
        )
        actualizados += 1
    else:
        # Asignar "Varios" por defecto
        cur.execute(
            "UPDATE productos SET categoria_id = %s WHERE id = %s",
            (cats.get('Varios'), prod_id)
        )
        sin_categoria += 1

conn.commit()
print(f"\n✓ Categorías asignadas!")
print(f"  Con categoría específica: {actualizados}")
print(f"  Asignados a Varios: {sin_categoria}")

cur.close()
conn.close()