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
            nombre: p.nombre,
            precio: p.precio_venta || 0,
            stock: p.stock_total || 0,
            almacen: p.almacen || 0,
            showroom: p.showroom || 0,
            categoria: p.categoria || 'Sin categoría',
            proveedor: p.proveedor || 'Sin proveedor',
            codigo: p.codigo_interno,
            badge: p.stock_total === 0 ? 'agotado' :
                p.stock_total <= 5 ? 'low' : ''
        }));

        // Métricas
        document.getElementById('total-prods').textContent = allProducts.length;
        document.getElementById('stock-critico').textContent =
            allProducts.filter(p => p.stock <= 5).length;

        renderProducts(allProducts);
        llenarFiltroProveedores();

    } catch (err) {
        grid.innerHTML = '<p style="color:var(--red);font-size:13px;grid-column:1/-1">Error conectando con la API. ¿Está corriendo el servidor?</p>';
        console.error(err);
    }
}

// ── RENDER PRODUCTOS ──
function renderProducts(list) {
    const grid = document.getElementById('product-grid');
    const count = document.getElementById('prod-count');
    count.textContent = `(${list.length} productos)`;

    if (list.length === 0) {
        grid.innerHTML = '<p style="color:var(--text2);font-size:13px;grid-column:1/-1">No se encontraron productos.</p>';
        return;
    }

    const emojis = {
        'Decoración del Hogar': '🏠',
        'Ropa y Textiles': '👗',
        'Juguetes y Entretenimiento': '🧸',
        'Cosméticos y Cuidado Personal': '💄',
        'Relojes y Accesorios': '⌚',
        'Papelería y Agendas': '📝',
        'Alimentos y Bebidas': '🍽️',
        'Electrónica y Tecnología': '💡',
        'Artículos de Limpieza': '🧹',
        'Velas y Aromatizadores': '🕯️',
        'Textiles de Baño': '🛁',
        'Marcos y Espejos': '🖼️',
        'Cortinas y Stores': '🪟',
        'Canastos y Organizadores': '🧺',
        'Bloques y Construcción': '🧩',
        'Muñecas y Accesorios': '🪆',
        'Juegos de Mesa': '🎮',
        'Varios': '📦',
        'Sin categoría': '📦'
    };

    grid.innerHTML = list.map((p, i) => `
    <div class="product-card" onclick="showProduct(${i})">
      ${p.badge === 'low' ? '<div class="badge badge-low">Stock bajo</div>' :
            p.badge === 'agotado' ? '<div class="badge badge-hot">Agotado</div>' : ''}
      <div class="prod-img">${emojis[p.categoria] || '📦'}</div>
      <div class="prod-name">${p.nombre}</div>
      <div class="prod-price">Bs. ${p.precio}</div>
      <div class="prod-meta">Stock: ${p.stock} u. · ${p.proveedor}</div>
    </div>
  `).join('');
}

// ── FILTROS ──
function filterProducts() {
    const q = document.getElementById('search-input').value.toLowerCase();
    const cat = document.getElementById('cat-filter').value;
    const prov = document.getElementById('prov-filter').value;

    const filtered = allProducts.filter(p =>
        p.nombre.toLowerCase().includes(q) &&
        (cat === '' || p.categoria === cat) &&
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
    ['catalogo', 'pedidos', 'analisis', 'clientes', 'proveedores'].forEach(x => {
        document.getElementById('view-' + x).style.display = x === v ? '' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    if (v === 'analisis') cargarAnalisis();
}

// ── TABS CLIENTES ──
function setTab(el, tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    ['frecuentes', 'nuevos', 'inactivos'].forEach(t => {
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

// ── ANÁLISIS ──
async function cargarAnalisis() {
  try {
    const [resCats, resProv, resCrit] = await Promise.all([
      fetch(`${API_URL}/analisis/por-categoria`),
      fetch(`${API_URL}/analisis/por-proveedor`),
      fetch(`${API_URL}/analisis/stock-critico`)
    ]);

    const cats  = await resCats.json();
    const provs = await resProv.json();
    const crits = await resCrit.json();

    // Métricas resumen
    const valorTotal    = cats.reduce((s, c) => s + (c.valor_total || 0), 0);
    const unidadesTotal = cats.reduce((s, c) => s + (c.stock_total || 0), 0);
    const topCat        = cats.filter(c => c.categoria !== 'Varios')[0];

    document.getElementById('val-total').textContent    = 'Bs. ' + Math.round(valorTotal).toLocaleString();
    document.getElementById('val-cats').textContent     = cats.length;
    document.getElementById('val-top-cat').textContent  = topCat ? topCat.categoria : '—';
    document.getElementById('val-unidades').textContent = Math.round(unidadesTotal).toLocaleString();

    // Gráfica categorías — barras horizontales
    const topCats = cats.filter(c => c.categoria && c.valor_total > 0 && c.categoria !== 'Varios')
                    .slice(0, 8);
    const maxVal  = Math.max(...topCats.map(c => c.valor_total));

    document.getElementById('chart-categorias').innerHTML = topCats.map(c => `
      <div class="bar-wrap">
        <span class="bar-label" style="font-size:11px">${c.categoria.replace(' y ', ' & ')}</span>
        <div class="bar-bg">
          <div class="bar-fill" style="width:${Math.round(c.valor_total/maxVal*100)}%;background:#7C3AED"></div>
        </div>
        <span style="font-size:11px;min-width:60px;text-align:right">Bs.${Math.round(c.valor_total).toLocaleString()}</span>
      </div>
    `).join('');

    // Gráfica proveedores
    const topProvs = provs.filter(p => p.num_productos > 0).slice(0, 8);
    const maxProv  = Math.max(...topProvs.map(p => p.valor_total));
    const colores  = ['#4C1D95','#6D28D9','#7C3AED','#9333EA','#A855F7','#C084FC','#DDD6FE','#EDE9FE'];

    document.getElementById('chart-proveedores').innerHTML = topProvs.map((p, i) => `
      <div class="bar-wrap">
        <span class="bar-label" style="font-size:11px">${p.proveedor}</span>
        <div class="bar-bg">
          <div class="bar-fill" style="width:${Math.round(p.valor_total/maxProv*100)}%;background:${colores[i]}"></div>
        </div>
        <span style="font-size:11px;min-width:60px;text-align:right">${p.num_productos} prods</span>
      </div>
    `).join('');

    // Tabla stock crítico
    document.getElementById('tabla-criticos').innerHTML = crits.length === 0
      ? '<p style="font-size:13px;color:var(--text2);padding:8px 0">No hay productos en stock crítico.</p>'
      : crits.map(p => `
          <div class="order-row">
            <span style="font-size:12px">${p.nombre.substring(0, 40)}${p.nombre.length > 40 ? '...' : ''}</span>
            <span style="font-size:12px">${p.categoria || 'Sin cat.'}</span>
            <span style="font-size:12px">${p.proveedor || '—'}</span>
            <span class="status ${p.stock_total === 0 ? 's-pendiente' : 's-enviado'}">${p.stock_total} u.</span>
          </div>
        `).join('');

    // Recomendación IA basada en datos reales
    const sinStock   = crits.filter(p => p.stock_total === 0).length;
    const bajoProv   = topProvs[0];
    document.getElementById('ai-recomendacion').innerHTML = `
      Se detectan <b>${crits.length} productos con stock crítico</b> (≤5 unidades), 
      de los cuales <b>${sinStock} están completamente agotados</b>.<br><br>
      El proveedor con mayor valor en inventario es <b>${bajoProv?.proveedor || '—'}</b> 
      con Bs. ${Math.round(bajoProv?.valor_total || 0).toLocaleString()} en stock.<br><br>
      Recomendación: priorizar reposición de productos en categorías 
      <b>${topCats[0]?.categoria || '—'}</b> y <b>${topCats[1]?.categoria || '—'}</b> 
      que representan el mayor valor del inventario.
    `;

  } catch(err) {
    console.error('Error cargando análisis:', err);
  }
}