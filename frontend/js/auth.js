// Usuarios de prueba (en Fase 4 esto vendrá de Supabase)
const USERS = [
  { email: 'admin@gmail.com',   password: 'admin123',   role: 'admin',    name: 'Administrador' },
  { email: 'ventas@gmail.com',  password: 'ventas123',  role: 'vendedor', name: 'Vendedor'      },
  { email: 'bodega@gmail.com',  password: 'bodega123',  role: 'bodega',   name: 'Bodega'        },
];

function handleLogin() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('btn-login');

  // Validación básica
  if (!email || !password) {
    showAlert('Por favor completa todos los campos.', 'error');
    return;
  }

  // Simular carga
  btn.disabled = true;
  btn.textContent = 'Verificando...';

  setTimeout(() => {
    const user = USERS.find(u => u.email === email && u.password === password);

    if (user) {
      // Guardar sesión
      sessionStorage.setItem('user', JSON.stringify(user));
      showAlert('Acceso correcto, redirigiendo...', 'success');
      setTimeout(() => {
        window.location.href = 'pages/dashboard.html';
      }, 800);
    } else {
      showAlert('Correo o contraseña incorrectos.', 'error');
      btn.disabled = false;
      btn.textContent = 'Iniciar sesión';
    }
  }, 600);
}

function showAlert(msg, type) {
  const box = document.getElementById('alert-box');
  box.textContent = msg;
  box.className = 'alert alert-' + type;
  box.style.display = 'block';
}

// Permitir login con Enter
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});