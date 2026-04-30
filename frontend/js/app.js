import { cargarProductos, filterProducts, showProduct } from './productos.js';
import { cargarAnalisis } from './analisis.js';
import { cargarProveedores, filterProveedores, verProductosProveedor, cerrarDetalle } from './proveedores.js';
import { cargarClientes, filterClientes, mostrarFormCliente, cerrarFormCliente, guardarCliente } from './clientes.js';
import { cargarPedidos, filterPedidos, cambiarEstado, abrirNuevoPedido, agregarAlCarrito, quitarDelCarrito, guardarPedido, cerrarFormPedido } from './pedidos.js';

// URL de la API
const API_URL = 'http://127.0.0.1:8000';

// Protección de ruta
const session = sessionStorage.getItem('user');
if (!session) window.location.href = '../index.html';
const user = JSON.parse(session);

// Mostrar usuario en header
document.getElementById('user-name').textContent = user.name;
document.getElementById('user-role').textContent = user.role;

// ── NAVEGACIÓN ──
function setView(v, el) {
  ['catalogo','pedidos','analisis','clientes','proveedores'].forEach(x => {
    document.getElementById('view-' + x).style.display = x === v ? '' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  if (v === 'analisis')    cargarAnalisis(API_URL);
  if (v === 'proveedores') cargarProveedores(API_URL);
  if (v === 'clientes')    cargarClientes(API_URL);
  if (v === 'pedidos') cargarPedidos(API_URL);
}

// ── LOGOUT ──
function logout() {
  sessionStorage.removeItem('user');
  window.location.href = '../index.html';
}

// Exponer funciones al HTML
window.setView               = setView;
window.logout                = logout;
window.filterProducts        = () => filterProducts();
window.showProduct           = (i) => showProduct(i);
window.filterProveedores     = () => filterProveedores();
window.verProductosProveedor = (id, n) => verProductosProveedor(id, n, API_URL);
window.cerrarDetalle         = () => cerrarDetalle();
window.filterClientes        = () => filterClientes();
window.mostrarFormCliente    = () => mostrarFormCliente();
window.cerrarFormCliente     = () => cerrarFormCliente();
window.guardarCliente        = () => guardarCliente(API_URL);
window.filterPedidos         = () => filterPedidos();
window.cambiarEstado         = (id, estado) => cambiarEstado(id, estado, API_URL);
window.abrirNuevoPedido      = () => abrirNuevoPedido(API_URL);
window.agregarAlCarrito      = () => agregarAlCarrito();
window.quitarDelCarrito      = (i) => quitarDelCarrito(i);
window.guardarPedido         = () => guardarPedido(API_URL);
window.cerrarFormPedido      = () => cerrarFormPedido();

// ── TABS CLIENTES ──
function setTab(el, tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    ['frecuentes', 'nuevos', 'inactivos'].forEach(t => {
        document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none';
    });
}

window.setTab = setTab;

// ── INICIO ──
cargarProductos(API_URL);







