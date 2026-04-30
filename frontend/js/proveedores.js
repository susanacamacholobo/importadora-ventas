export let allProveedores = [];

export async function cargarProveedores(API_URL) {
  try {
    const res  = await fetch(`${API_URL}/proveedores/`);
    const data = await res.json();
    allProveedores = data;

    document.getElementById('prov-total').textContent        = data.length;
    document.getElementById('prov-importadores').textContent = data.filter(p => p.tipo === 'importador').length;
    document.getElementById('prov-locales').textContent      = data.filter(p => p.tipo === 'local').length;
    document.getElementById('prov-consignacion').textContent = data.filter(p => p.tipo === 'consignacion').length;

    renderProveedores(data);
  } catch(err) {
    console.error('Error cargando proveedores:', err);
  }
}

export function renderProveedores(list) {
  const tipoColor = {
    'importador':  's-enviado',
    'local':       's-entregado',
    'consignacion':'s-pendiente',
    'mixto':       's-pendiente'
  };

  document.getElementById('tabla-proveedores').innerHTML = list.length === 0
    ? '<p style="font-size:13px;color:var(--text2);padding:8px 0">No se encontraron proveedores.</p>'
    : list.map(p => `
        <div class="order-row" style="grid-template-columns:1.5fr 0.8fr 0.8fr 0.3fr" ...>
          <span><b>${p.nombre}</b>${p.nombre_corto ? '<br><span style="font-size:10px;color:var(--text2)">'+p.nombre_corto+'</span>' : ''}</span>
          <span style="font-size:12px">${p.tipo}</span>
          <span style="font-size:12px">${p.num_productos} productos</span>
          <span class="status ${p.activo ? tipoColor[p.tipo] : 's-pendiente'}">${p.activo ? 'Activo' : 'Inactivo'}</span>
        </div>
      `).join('');
}

export function filterProveedores() {
  const q    = document.getElementById('prov-search').value.toLowerCase();
  const tipo = document.getElementById('prov-tipo').value;
  renderProveedores(allProveedores.filter(p =>
    p.nombre.toLowerCase().includes(q) &&
    (tipo === '' || p.tipo === tipo)
  ));
}

export async function verProductosProveedor(id, nombre, API_URL) {
  try {
    const res  = await fetch(`${API_URL}/proveedores/${id}/productos`);
    const data = await res.json();

    document.getElementById('detalle-prov-nombre').textContent = `${nombre} — ${data.length} productos`;
    document.getElementById('detalle-proveedor').style.display = '';

    document.getElementById('detalle-prov-productos').innerHTML = `
      <div class="order-row header-row">
        <span>Producto</span><span>Categoría</span><span>Precio</span><span>Stock</span>
      </div>
      ${data.map(p => `
        <div class="order-row">
          <span style="font-size:12px">${p.nombre.substring(0,45)}${p.nombre.length>45?'...':''}</span>
          <span style="font-size:12px">${p.categoria || 'Varios'}</span>
          <span style="font-size:12px">Bs. ${p.precio_venta}</span>
          <span class="status ${p.stock_total === 0 ? 's-pendiente' : p.stock_total <= 5 ? 's-enviado' : 's-entregado'}">${p.stock_total} u.</span>
        </div>
      `).join('')}
    `;

    document.getElementById('detalle-proveedor').scrollIntoView({ behavior: 'smooth' });
  } catch(err) {
    console.error(err);
  }
}

export function cerrarDetalle() {
  document.getElementById('detalle-proveedor').style.display = 'none';
}