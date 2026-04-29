// Protección de ruta — si no hay sesión vuelve al login
const session = sessionStorage.getItem('user');
if (!session) {
  window.location.href = '../index.html';
}
const user = JSON.parse(session);

// Mostrar nombre y rol en el header
document.getElementById('user-name').textContent = user.name;
document.getElementById('user-role').textContent = user.role;

// Productos reales de TUMOMITO (del inventario)
const products = [
  { name: 'Cortina Gancho Black',      price: 80,   stock: 5,  emoji: '🪟', cat: 'Hogar/Deco',  prov: 'Casa Ideas', badge: 'low' },
  { name: 'Guirnalda Luces Bebé',      price: 22,   stock: 45, emoji: '✨', cat: 'Hogar/Deco',  prov: 'Casa Ideas', badge: 'hot' },
  { name: 'Bombilla LED Colgante',      price: 12,   stock: 50, emoji: '💡', cat: 'Lámparas',    prov: 'Casa Ideas', badge: 'hot' },
  { name: 'Termo Individual Vintage',   price: 35,   stock: 7,  emoji: '♨️', cat: 'Cocina/Baño', prov: 'Casa Ideas', badge: 'low' },
  { name: 'Store Blackout 150x220',     price: 87,   stock: 11, emoji: '🪟', cat: 'Hogar/Deco',  prov: 'Casa Ideas', badge: ''    },
  { name: 'Set 16 Cubiertos Oro',       price: 223,  stock: 1,  emoji: '🍴', cat: 'Cocina/Baño', prov: 'Acricolor',  badge: 'low' },
  { name: 'Lámpara Colgante Cristal',   price: 585,  stock: 6,  emoji: '🔆', cat: 'Lámparas',    prov: 'Acricolor',  badge: 'hot' },
  { name: 'Lámpara de Pie Cobre',       price: 369,  stock: 2,  emoji: '🔆', cat: 'Lámparas',    prov: 'Acricolor',  badge: 'low' },
  { name: 'Copa Vino Vidrio 340ml',     price: 20,   stock: 4,  emoji: '🍷', cat: 'Cocina/Baño', prov: 'Acricolor',  badge: 'low' },
  { name: 'Mochila Plegable 20L',       price: 26,   stock: 27, emoji: '🎒', cat: 'Accesorios',  prov: 'Casa Ideas', badge: ''    },
  { name: 'Bolso Inflable',             price: 23,   stock: 44, emoji: '👜', cat: 'Accesorios',  prov: 'Casa Ideas', badge: 'new' },
  { name: 'Audífonos Pepita',           price: 22,   stock: 21, emoji: '🎧', cat: 'Accesorios',  prov: 'Kimpro',     badge: ''    },
  { name: 'Block Puzzle',               price: 156,  stock: 8,  emoji: '🧩', cat: 'Juguetes',    prov: 'Chikipoom',  badge: 'hot' },
  { name: 'Muñeca Bebé con Sonido',     price: 88,   stock: 3,  emoji: '🪆', cat: 'Juguetes',    prov: 'Chikipoom',  badge: 'low' },
  { name: 'Pista de Auto',             price: 186,  stock: 4,  emoji: '🏎️', cat: 'Juguetes',    prov: 'Chikipoom',  badge: ''    },
  { name: 'Notas Adhesivas Diseño',     price: 13,   stock: 22, emoji: '📝', cat: 'Papelería',   prov: 'Casa Ideas', badge: ''    },
  { name: 'Set 3 Lápices Tinta Gel',   price: 12,   stock: 15, emoji: '✏️', cat: 'Papelería',   prov: 'Casa Ideas', badge: 'new' },
  { name: 'Billetera Papelería',        price: 13,   stock: 24, emoji: '👛', cat: 'Papelería',   prov: 'Casa Ideas', badge: ''    },
  { name: 'Marcador Maleta Forma',      price: 12,   stock: 43, emoji: '🏷️', cat: 'Accesorios',  prov: 'Casa Ideas', badge: 'new' },
  { name: 'Set Creación Corona Flores', price: 19,   stock: 45, emoji: '🌸', cat: 'Hogar/Deco',  prov: 'Casa Ideas', badge: 'new' },
];

function renderProducts(list) {
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('prod-count');
  count.textContent = `(${list.length} productos)`;

  if (list.length === 0) {
    grid.innerHTML = '<p style="color:var(--text2);font-size:13px;grid-column:1/-1">No se encontraron productos.</p>';
    return;
  }

  grid.innerHTML = list.map((p, i) => `
    <div class="product-card" onclick="showProduct(${i})">
      ${p.badge === 'hot' ? '<div class="badge badge-hot">Más vendido</div>' :
        p.badge === 'new' ? '<div class="badge badge-new">Nuevo</div>' :
        p.badge === 'low' ? '<div class="badge badge-low">Stock bajo</div>' : ''}
      <div class="prod-img">${p.emoji}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-price">Bs. ${p.price}</div>
      <div class="prod-meta">${p.stock} u. · ${p.cat}</div>
      <div class="prod-meta" style="color:var(--text2)">${p.prov}</div>
    </div>
  `).join('');
}

function filterProducts() {
  const q    = document.getElementById('search-input').value.toLowerCase();
  const cat  = document.getElementById('cat-filter').value;
  const prov = document.getElementById('prov-filter').value;

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) &&
    (cat  === '' || p.cat  === cat) &&
    (prov === '' || p.prov === prov)
  );
  renderProducts(filtered);
}

function showProduct(i) {
  const p = products[i];
  alert(`${p.name}\nPrecio: Bs. ${p.price}\nStock: ${p.stock} u.\nCategoría: ${p.cat}\nProveedor: ${p.prov}`);
}

// Métricas
document.getElementById('total-prods').textContent = products.length;
document.getElementById('stock-critico').textContent = products.filter(p => p.stock <= 5).length;

// Navegación
function setView(v, el) {
  ['catalogo','pedidos','analisis','clientes','proveedores'].forEach(x => {
    document.getElementById('view-' + x).style.display = x === v ? '' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

// Tabs clientes
function setTab(el, tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['frecuentes','nuevos','inactivos'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none';
  });
}

// Logout
function logout() {
  sessionStorage.removeItem('user');
  window.location.href = '../index.html';
}

// Render inicial
renderProducts(products);