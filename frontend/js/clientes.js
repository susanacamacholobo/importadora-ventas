export let allClientes = [];
let editandoClienteId = null;

export async function cargarClientes(API_URL) {
  try {
    const res  = await fetch(`${API_URL}/clientes/`);
    const data = await res.json();
    allClientes = data;

    const facturado  = data.reduce((s, c) => s + (c.total_compras || 0), 0);
    const conCompras = data.filter(c => c.num_pedidos > 0).length;
    const hoy        = new Date();

    document.getElementById('cli-total').textContent     = data.length;
    document.getElementById('cli-activos').textContent   = conCompras;
    document.getElementById('cli-facturado').textContent = 'Bs. ' + Math.round(facturado).toLocaleString();
    document.getElementById('cli-nuevos').textContent    = data.filter(c => {
      const f = new Date(c.creado_en);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }).length;

    renderClientes(data);
  } catch(err) {
    console.error('Error cargando clientes:', err);
  }
}

export function renderClientes(list) {
  const tabla = document.getElementById('tabla-clientes');
  if (list.length === 0) {
    tabla.innerHTML = '<p style="font-size:13px;color:var(--text2);padding:12px 0">No hay clientes aún. ¡Agrega el primero!</p>';
    return;
  }
  tabla.innerHTML = list.map(c => `
    <div class="order-row" style="grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr 0.8fr">
      <span>
        <b>${c.nombre}</b>
        ${c.ruc_nit ? '<br><span style="font-size:10px;color:var(--text2)">NIT: '+c.ruc_nit+'</span>' : ''}
      </span>
      <span style="font-size:12px">${c.email || '—'}</span>
      <span style="font-size:12px">${c.telefono || '—'}</span>
      <span style="font-size:12px">${c.num_pedidos} pedidos</span>
      <span class="status ${c.total_compras > 0 ? 's-entregado' : 's-pendiente'}">
        Bs. ${Math.round(c.total_compras).toLocaleString()}
      </span>
    </div>
  `).join('');
}

export function filterClientes() {
  const q = document.getElementById('cli-search').value.toLowerCase();
  renderClientes(allClientes.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    (c.email    && c.email.toLowerCase().includes(q)) ||
    (c.telefono && c.telefono.includes(q))
  ));
}

export function mostrarFormCliente() {
  editandoClienteId = null;
  document.getElementById('form-cli-titulo').textContent = 'Nuevo cliente';
  ['cli-nombre','cli-telefono','cli-email','cli-nit','cli-direccion']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('form-cliente').style.display = '';
  document.getElementById('cli-nombre').focus();
}

export function cerrarFormCliente() {
  document.getElementById('form-cliente').style.display = 'none';
  document.getElementById('cli-mensaje').style.display  = 'none';
}

export async function guardarCliente(API_URL) {
  const nombre = document.getElementById('cli-nombre').value.trim();
  if (!nombre) { mostrarMensajeCli('El nombre es obligatorio.', 'error'); return; }

  const datos = {
    nombre,
    telefono:       document.getElementById('cli-telefono').value.trim() || null,
    email:          document.getElementById('cli-email').value.trim()    || null,
    ruc_nit:        document.getElementById('cli-nit').value.trim()      || null,
    direccion:      document.getElementById('cli-direccion').value.trim()|| null,
    limite_credito: 0
  };

  try {
    const url    = editandoClienteId ? `${API_URL}/clientes/${editandoClienteId}` : `${API_URL}/clientes/`;
    const method = editandoClienteId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      mostrarMensajeCli('Cliente guardado correctamente.', 'ok');
      setTimeout(() => {
        cerrarFormCliente();
        cargarClientes(API_URL);
      }, 800);
    } else {
      mostrarMensajeCli('Error al guardar.', 'error');
    }
  } catch(err) {
    mostrarMensajeCli('Error de conexión.', 'error');
  }
}

function mostrarMensajeCli(msg, tipo) {
  const el = document.getElementById('cli-mensaje');
  el.textContent   = msg;
  el.style.display = 'block';
  el.style.color   = tipo === 'ok' ? '#0F6E56' : '#993C1D';
}