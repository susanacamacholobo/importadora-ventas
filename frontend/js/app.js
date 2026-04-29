// Protección de ruta
const session = sessionStorage.getItem('user');
if (!session) window.location.href = '../index.html';
const user = JSON.parse(session);

// URL de la API
const API_URL = 'http://127.0.0.1:8000';

// Mostrar usuario en header
document.getElementById('user-name').textContent = user.name;
document.getElementById('user-role').textContent = user.role;

// Estado global
let allProducts = [];

// ── CARGAR PRODUCTOS DESDE LA API ──
async function cargarProductos() {
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('prod-count');
  grid.innerHTML = '<p style="color:var(--text2);font-size:13px;grid-column:1/-1">Cargando productos...</p>';

  try {
    const res = await fetch(`${API_URL}/productos/stock`);
    const data = await res.json();

    allProducts = data.map(p => ({
      nombre:    p.nombre,
      precio:    p.precio_venta || 0,
      stock:     p.stock_total  || 0,
      almacen:   p.almacen      || 0,
      showroom:  p.showroom     || 0,
      categoria: p.categoria    || 'Sin categoría',
      proveedor: p.proveedor    || 'Sin proveedor',
      codigo:    p.codigo_interno,
      badge:     p.stock_total === 0 ? 'agotado' :
                 p.stock_total <= 5  ? 'low' : ''
    }));

    // Métricas
    document.getElementById('total-prods').textContent = allProducts.length;
    document.getElementById('stock-critico').textContent =
      allProducts.filter(p => p.stock <= 5).length;

    renderProducts(allProducts);
    llenarFiltroProveedores();

  } catch(err) {
    grid.innerHTML = '<p style="color:var(--red);font-size:13px;grid-column:1/-1">Error conectando con la API. ¿Está corriendo el servidor?</p>';
    console.error(err);
  }
}

// ── RENDER PRODUCTOS ──
function renderProducts(list) {
  const grid  = document.getElementById('product-grid');
  const count = document.getElementById('prod-count');
  count.textContent = `(${list.length} productos)`;

  if (list.length === 0) {
    grid.innerHTML = '<p style="color:var(--text2);font-size:13px;grid-column:1/-1">No se encontraron productos.</p>';
    return;
  }

  const emojis = {
    'Hogar/Deco': '🏠', 'Cocina/Baño': '🍳', 'Papelería': '📝',
    'Juguetes': '🧸', 'Accesorios': '👜', 'Lámparas': '💡',
    'Sin categoría': '📦'
  };

  grid.innerHTML = list.map((p, i) => `
    <div class="product-card" onclick="showProduct(${i})">
      ${p.badge === 'low'    ? '<div class="badge badge-low">Stock bajo</div>'  :
        p.badge === 'agotado'? '<div class="badge badge-hot">Agotado</div>'     : ''}
      <div class="prod-img">${emojis[p.categoria] || '📦'}</div>
      <div class="prod-name">${p.nombre}</div>
      <div class="prod-price">Bs. ${p.precio}</div>
      <div class="prod-meta">Stock: ${p.stock} u. · ${p.proveedor}</div>
    </div>
  `).join('');
}

// ── FILTROS ──
function filterProducts() {
  const q    = document.getElementById('search-input').value.toLowerCase();
  const cat  = document.getElementById('cat-filter').value;
  const prov = document.getElementById('prov-filter').value;

  const filtered = allProducts.filter(p =>
    p.nombre.toLowerCase().includes(q) &&
    (cat  === '' || p.categoria === cat) &&
    (prov === '' || p.proveedor === prov)
  );
  renderProducts(filtered);
}

function llenarFiltroProveedores() {
  const select = document.getElementById('prov-filter');
  const proveedores = [...new Set(allProducts.map(p => p.proveedor))].sort();
  select.innerHTML = '<option value="">Todos los proveedores</option>' +
    proveedores.map(p => `<option value="${p}">${p}</option>`).join('');
}

// ── DETALLE PRODUCTO ──
function showProduct(i) {
  const p = allProducts[i];
  alert(`${p.nombre}\nCódigo: ${p.codigo}\nPrecio: Bs. ${p.precio}\nStock total: ${p.stock} u.\nAlmacén: ${p.almacen} | Showroom: ${p.showroom}\nProveedor: ${p.proveedor}`);
}

// ── NAVEGACIÓN ──
function setView(v, el) {
  ['catalogo','pedidos','analisis','clientes','proveedores'].forEach(x => {
    document.getElementById('view-' + x).style.display = x === v ? '' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

// ── TABS CLIENTES ──
function setTab(el, tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['frecuentes','nuevos','inactivos'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none';
  });
}

// ── LOGOUT ──
function logout() {
  sessionStorage.removeItem('user');
  window.location.href = '../index.html';
}

// ── INICIO ──
cargarProductos();