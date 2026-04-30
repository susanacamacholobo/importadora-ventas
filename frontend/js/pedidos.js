let allPedidos = [];
let carrito = [];
let clientesDisponibles = [];
let productosDisponibles = [];

export async function cargarPedidos(API_URL) {
  try {
    const res  = await fetch(`${API_URL}/pedidos/`);
    const data = await res.json();
    allPedidos = data;

    const total      = data.reduce((s, p) => s + (p.total || 0), 0);
    const pendientes = data.filter(p => p.estado === 'borrador' || p.estado === 'confirmado').length;
    const entregados = data.filter(p => p.estado === 'entregado').length;

    document.getElementById('ped-total').textContent      = data.length;
    document.getElementById('ped-pendientes').textContent = pendientes;
    document.getElementById('ped-entregados').textContent = entregados;
    document.getElementById('ped-facturado').textContent  = 'Bs. ' + Math.round(total).toLocaleString();

    renderPedidos(data);
  } catch(err) { console.error(err); }
}

export function renderPedidos(list) {
  const tabla = document.getElementById('tabla-pedidos');
  if (list.length === 0) {
    tabla.innerHTML = '<p style="font-size:13px;color:var(--text2);padding:12px 0">No hay pedidos aún. ¡Crea el primero!</p>';
    return;
  }
  const estadoColor = {
    'borrador':   's-pendiente',
    'confirmado': 's-enviado',
    'despachado': 's-enviado',
    'entregado':  's-entregado',
    'cancelado':  's-pendiente'
  };
  tabla.innerHTML = list.map(p => `
    <div class="order-row" style="grid-template-columns:0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 1fr">
      <span style="font-size:12px;font-weight:500">${p.numero}</span>
      <span style="font-size:12px"><b>${p.cliente}</b>${p.cliente_telefono ? '<br><span style="color:var(--text2)">'+p.cliente_telefono+'</span>' : ''}</span>
      <span style="font-size:12px">${p.num_productos} productos</span>
      <span style="font-size:12px">${new Date(p.fecha).toLocaleDateString('es-BO')}</span>
      <span style="font-size:12px;font-weight:500;color:#7C3AED">Bs. ${Math.round(p.total).toLocaleString()}</span>
      <span style="display:flex;align-items:center;gap:6px">
        <span class="status ${estadoColor[p.estado]}">${p.estado}</span>
        ${p.estado !== 'entregado' && p.estado !== 'cancelado' ? `
          <select onchange="cambiarEstado(${p.id}, this.value)" style="font-size:10px;border:0.5px solid var(--border);border-radius:4px;padding:2px 4px;background:var(--bg2);color:var(--text1)">
            <option value="">Cambiar...</option>
            <option value="confirmado">Confirmado</option>
            <option value="despachado">Despachado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>` : ''}
      </span>
    </div>
  `).join('');
}

export function filterPedidos() {
  const q      = document.getElementById('ped-search').value.toLowerCase();
  const estado = document.getElementById('ped-estado').value;
  renderPedidos(allPedidos.filter(p =>
    (p.numero.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q)) &&
    (estado === '' || p.estado === estado)
  ));
}

export async function cambiarEstado(id, estado, API_URL) {
  if (!estado) return;
  try {
    await fetch(`${API_URL}/pedidos/${id}/estado?estado=${estado}`, { method: 'PATCH' });
    cargarPedidos(API_URL);
  } catch(err) { console.error(err); }
}

export async function abrirNuevoPedido(API_URL) {
  try {
    const [resCli, resProd] = await Promise.all([
      fetch(`${API_URL}/clientes/`),
      fetch(`${API_URL}/productos/`)        // ← cambiado a /productos/
    ]);
    clientesDisponibles  = await resCli.json();
    productosDisponibles = await resProd.json();
    carrito = [];

    document.getElementById('ped-cliente').innerHTML =
      '<option value="">Selecciona un cliente...</option>' +
      clientesDisponibles.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

    // ← sin filtro de stock, usa id directamente
    document.getElementById('ped-producto').innerHTML =
      '<option value="">Selecciona un producto...</option>' +
      productosDisponibles.map(p =>
        `<option value="${p.id}" data-precio="${p.precio_venta}" data-stock="999">${p.nombre} — Bs.${p.precio_venta}</option>`
      ).join('');

    renderCarrito();
    document.getElementById('form-pedido').style.display = '';
    document.getElementById('form-pedido').scrollIntoView({ behavior: 'smooth' });
  } catch(err) { console.error(err); }
}

export function agregarAlCarrito() {
  const select   = document.getElementById('ped-producto');
  const option   = select.options[select.selectedIndex];
  const cantidad = parseInt(document.getElementById('ped-cantidad').value) || 1;
  const prodId   = parseInt(select.value);

  if (!prodId) return;

  const precio = parseFloat(option.dataset.precio) || 0;
  const nombre = option.text.split(' — ')[0];

  const existe = carrito.findIndex(c => c.producto_id === prodId);
  if (existe >= 0) {
    carrito[existe].cantidad += cantidad;
  } else {
    carrito.push({ producto_id: prodId, nombre, cantidad, precio_unitario: precio });
  }
  renderCarrito();
}

export function quitarDelCarrito(i) {
  carrito.splice(i, 1);
  renderCarrito();
}

function renderCarrito() {
  const lista = document.getElementById('carrito-lista');
  const total = carrito.reduce((s, c) => s + c.cantidad * c.precio_unitario, 0);

  if (carrito.length === 0) {
    lista.innerHTML = '<p style="font-size:12px;color:var(--text2);padding:8px 0">Sin productos aún.</p>';
  } else {
    lista.innerHTML = carrito.map((c, i) => `
      <div class="order-row" style="grid-template-columns:1fr auto auto auto">
        <span style="font-size:12px">${c.nombre}</span>
        <span style="font-size:12px">${c.cantidad} u.</span>
        <span style="font-size:12px;color:#7C3AED">Bs. ${(c.cantidad * c.precio_unitario).toLocaleString()}</span>
        <button onclick="quitarDelCarrito(${i})" style="background:none;border:none;color:#993C1D;cursor:pointer;font-size:12px">✕</button>
      </div>
    `).join('');
  }

  document.getElementById('carrito-total').textContent = 'Total: Bs. ' + Math.round(total).toLocaleString();
}

export async function guardarPedido(API_URL) {
  const clienteId = parseInt(document.getElementById('ped-cliente').value);
  if (!clienteId) { alert('Selecciona un cliente.'); return; }
  if (carrito.length === 0) { alert('Agrega al menos un producto.'); return; }

  const datos = {
    cliente_id:    clienteId,
    observaciones: document.getElementById('ped-observaciones').value || null,
    detalles:      carrito.map(c => ({
      producto_id:     c.producto_id,
      cantidad:        c.cantidad,
      precio_unitario: c.precio_unitario
    }))
  };

  try {
    const res = await fetch(`${API_URL}/pedidos/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(datos)
    });

    if (res.ok) {
      const resultado = await res.json();
      alert(`Pedido ${resultado.numero} creado — Total: Bs. ${resultado.total}`);
      document.getElementById('form-pedido').style.display = 'none';
      cargarPedidos(API_URL);
    } else {
      alert('Error al crear el pedido.');
    }
  } catch(err) { console.error(err); }
}

export function cerrarFormPedido() {
  document.getElementById('form-pedido').style.display = 'none';
  carrito = [];
}