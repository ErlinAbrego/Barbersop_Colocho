
/* ============================================================
   BARBERIA EL COLOCHO \u2014 Sistema de Gesti\u00f3n
   JavaScript Principal \u2014 app.js
   ============================================================ */

'use strict';

// ============================================================
// 1. ESTADO GLOBAL
// ============================================================
let state = {
  productos:  JSON.parse(localStorage.getItem('bc_productos'))  || [],
  servicios:  JSON.parse(localStorage.getItem('bc_servicios'))  || [],
  clientes:   JSON.parse(localStorage.getItem('bc_clientes'))   || [],
  barberos:   JSON.parse(localStorage.getItem('bc_barberos'))   || [],
  ventas:     JSON.parse(localStorage.getItem('bc_ventas'))     || [],
  citas:      JSON.parse(localStorage.getItem('bc_citas'))      || [],
  config:     JSON.parse(localStorage.getItem('bc_config'))     || {
    nombre: 'Barber\u00eda El Colocho',
    direccion: '',
    telefono: '',
    email: '',
    moneda: 'Q',
    stockMin: 5,
    apertura: '08:00',
    cierre: '20:00'
  }
};

let cart = [];
let chartGanancias = null;
let chartCategorias = null;
let chartSemanal = null;
let chartReporteDiario = null;
let chartServiciosVsProductos = null;
let currentChartType = 'bar';
let currentPage = 'dashboard';
let selectedVentaForExport = null;
let currentCitaFilter = 'hoy';

// ============================================================
// 2. PERSISTENCIA
// ============================================================
function save(key) {
  localStorage.setItem('bc_' + key, JSON.stringify(state[key]));
}

function saveAll() {
  ['productos','servicios','clientes','barberos','ventas','citas','config'].forEach(save);
}

// ============================================================
// 3. DATOS INICIALES (si no hay datos)
// ============================================================
function initDefaultData() {
  if (state.servicios.length === 0) {
    state.servicios = [
      { id: uid(), nombre: 'Corte Cl\u00e1sico',         precio: 50,  duracion: 30, emoji: '\u2702\ufe0f',  descripcion: 'Corte tradicional a tijera o m\u00e1quina' },
      { id: uid(), nombre: 'Corte + Barba',          precio: 80,  duracion: 45, emoji: '\ud83d\udc88',  descripcion: 'Corte y arreglo de barba' },
      { id: uid(), nombre: 'Degradado / Fade',        precio: 65,  duracion: 40, emoji: '\ud83e\ude92',  descripcion: 'Degradado de piel a n\u00famero' },
      { id: uid(), nombre: 'Arreglo de Barba',        precio: 35,  duracion: 20, emoji: '\ud83e\uddd4',  descripcion: 'Perfilado y arreglo de barba' },
      { id: uid(), nombre: 'Afeitado Cl\u00e1sico',        precio: 45,  duracion: 25, emoji: '\ud83e\ude92',  descripcion: 'Afeitado con navaja y toalla caliente' },
      { id: uid(), nombre: 'Tratamiento Capilar',     precio: 90,  duracion: 60, emoji: '\ud83d\udc86',  descripcion: 'Hidrataci\u00f3n y tratamiento del cuero cabelludo' },
      { id: uid(), nombre: 'Dise\u00f1o / Puntas',         precio: 40,  duracion: 20, emoji: '\ud83c\udfa8',  descripcion: 'Dise\u00f1o en el cabello y puntas' },
      { id: uid(), nombre: 'Tinte / Color',           precio: 120, duracion: 90, emoji: '\ud83c\udfa8',  descripcion: 'Aplicaci\u00f3n de tinte o color' },
    ];
    save('servicios');
  }

  if (state.productos.length === 0) {
    state.productos = [
      { id: uid(), nombre: 'Pomada Capilar Fuerte',  categoria: 'Cabello',   precio: 45,  costo: 25, stock: 20, stockMin: 5,  emoji: '\ud83e\uded9', marca: 'BarberPro',  descripcion: 'Fijaci\u00f3n fuerte con brillo' },
      { id: uid(), nombre: 'Aceite de Barba',         categoria: 'Barba',     precio: 55,  costo: 28, stock: 15, stockMin: 4,  emoji: '\ud83c\udf76', marca: 'BeardKing',  descripcion: 'Hidrataci\u00f3n y suavizado de barba' },
      { id: uid(), nombre: 'Crema para Afeitar',      categoria: 'Cremas',    precio: 38,  costo: 18, stock: 12, stockMin: 5,  emoji: '\ud83e\uddf4', marca: 'Gillette',   descripcion: 'Crema de afeitado premium' },
      { id: uid(), nombre: 'Loci\u00f3n Aftershave',       categoria: 'Lociones',  precio: 60,  costo: 30, stock: 10, stockMin: 4,  emoji: '\ud83e\uddf4', marca: 'Old Spice',  descripcion: 'Loci\u00f3n post afeitado' },
      { id: uid(), nombre: 'Shampoo para Hombre',     categoria: 'Cabello',   precio: 42,  costo: 20, stock: 18, stockMin: 5,  emoji: '\ud83e\uddf4', marca: 'Head&Sh',    descripcion: 'Shampoo anticaspa' },
      { id: uid(), nombre: 'Refresco Coca-Cola',      categoria: 'Bebidas',   precio: 12,  costo: 7,  stock: 24, stockMin: 10, emoji: '\ud83e\udd64', marca: 'Coca-Cola',  descripcion: 'Refresco 500ml' },
      { id: uid(), nombre: 'Agua Pura',               categoria: 'Bebidas',   precio: 8,   costo: 4,  stock: 30, stockMin: 10, emoji: '\ud83d\udca7', marca: 'Fuente',     descripcion: 'Agua pura 500ml' },
      { id: uid(), nombre: 'Gorra El Colocho',        categoria: 'Gorras',    precio: 85,  costo: 40, stock: 8,  stockMin: 3,  emoji: '\ud83e\udde2', marca: 'Colocho',    descripcion: 'Gorra estampada marca propia' },
      { id: uid(), nombre: 'Cera Mate',               categoria: 'Cabello',   precio: 50,  costo: 25, stock: 14, stockMin: 5,  emoji: '\ud83e\uded9', marca: 'Mandom',     descripcion: 'Cera mate fijaci\u00f3n media' },
      { id: uid(), nombre: 'Loci\u00f3n Hidratante',       categoria: 'Lociones',  precio: 70,  costo: 35, stock: 6,  stockMin: 4,  emoji: '\ud83e\uddf4', marca: 'Nivea',      descripcion: 'Loci\u00f3n hidratante corporal' },
      { id: uid(), nombre: 'Peine Profesional',       categoria: 'Accesorios',precio: 25,  costo: 10, stock: 20, stockMin: 5,  emoji: '\ud83e\udeae', marca: 'Generic',    descripcion: 'Peine de bolsillo' },
      { id: uid(), nombre: 'Gorra Snapback',          categoria: 'Gorras',    precio: 110, costo: 55, stock: 5,  stockMin: 3,  emoji: '\ud83e\udde2', marca: 'NewEra',     descripcion: 'Gorra snapback ajustable' },
    ];
    save('productos');
  }

  if (state.barberos.length === 0) {
    state.barberos = [
      { id: uid(), nombre: 'Carlos P\u00e9rez',    especialidad: 'Degradados y Fades', telefono: '+502 5555-1111', comision: 40, activo: true },
      { id: uid(), nombre: 'Jos\u00e9 Mart\u00ednez',   especialidad: 'Cortes Cl\u00e1sicos',    telefono: '+502 5555-2222', comision: 35, activo: true },
      { id: uid(), nombre: 'Miguel Rodr\u00edguez',especialidad: 'Dise\u00f1os y Tintes',   telefono: '+502 5555-3333', comision: 40, activo: true },
    ];
    save('barberos');
  }

  if (state.clientes.length === 0) {
    state.clientes = [
      { id: uid(), nombre: 'Juan Garc\u00eda',     telefono: '+502 4111-2222', email: 'juan@gmail.com',  nacimiento: '1990-05-15', notas: 'Le gusta el degradado',    fechaRegistro: today() },
      { id: uid(), nombre: 'Pedro L\u00f3pez',     telefono: '+502 4222-3333', email: 'pedro@gmail.com', nacimiento: '1985-08-22', notas: 'Prefiere navaja',           fechaRegistro: today() },
      { id: uid(), nombre: 'Luis Torres',     telefono: '+502 4333-4444', email: '',                nacimiento: '',           notas: '',                          fechaRegistro: today() },
      { id: uid(), nombre: 'Roberto Ruiz',    telefono: '+502 4444-5555', email: '',                nacimiento: '1998-12-03', notas: 'Clientela fija los viernes', fechaRegistro: today() },
    ];
    save('clientes');
  }

  if (state.citas.length === 0) {
    const hoy = today();
    state.citas = [
      { id: uid(), cliente: 'Juan Garc\u00eda',  barbero: state.barberos[0]?.nombre || 'Carlos', fecha: hoy, hora: '09:00', servicio: 'Corte Cl\u00e1sico',   estado: 'confirmed', notas: '' },
      { id: uid(), cliente: 'Pedro L\u00f3pez',  barbero: state.barberos[1]?.nombre || 'Jos\u00e9',   fecha: hoy, hora: '10:30', servicio: 'Corte + Barba',    estado: 'pending',   notas: 'Llegar puntual' },
      { id: uid(), cliente: 'Luis Torres',  barbero: state.barberos[0]?.nombre || 'Carlos', fecha: hoy, hora: '12:00', servicio: 'Degradado / Fade', estado: 'pending',   notas: '' },
    ];
    save('citas');
  }

  if (state.ventas.length === 0) {
    // Simular ventas pasadas para gr\u00e1ficas
    const months = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06'];
    const amounts = [3200, 4100, 3800, 5200, 4900, 6100];
    months.forEach((m, i) => {
      for (let d = 0; d < 4; d++) {
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        state.ventas.push({
          id: uid(),
          numero: state.ventas.length + 1,
          fecha: `${m}-${day}`,
          hora: '10:00',
          cliente: state.clientes[d % state.clientes.length]?.nombre || 'Consumidor final',
          barbero: state.barberos[d % state.barberos.length]?.nombre || 'Carlos',
          items: [{ tipo: 'servicio', nombre: 'Corte Cl\u00e1sico', precio: amounts[i] / 4, qty: 1 }],
          subtotal: amounts[i] / 4,
          descuento: 0,
          iva: 0,
          total: amounts[i] / 4,
          metodoPago: 'Efectivo',
          nota: '',
          estado: 'completada'
        });
      }
    });
    save('ventas');
  }
}

// ============================================================
// 4. UTILIDADES
// ============================================================
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function fmtMoney(n) {
  const symbol = state.config.moneda || 'Q';
  return symbol + parseFloat(n || 0).toFixed(2);
}

function fmtDate(d) {
  if (!d) return '\u2014';
  const [y, m, day] = d.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${day} ${months[parseInt(m)-1]} ${y}`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function categoryEmoji(cat) {
  const map = { Cabello:'\ud83d\udc87', Barba:'\ud83e\uddd4', Cremas:'\ud83e\uddf4', Lociones:'\ud83c\udf76', Bebidas:'\ud83e\udd64', Gorras:'\ud83e\udde2', Accesorios:'\ud83c\udfa9', Otro:'\ud83d\udce6' };
  return map[cat] || '\ud83d\udce6';
}

// ============================================================
// 5. NAVEGACI\u00d3N
// ============================================================
function showPage(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById('page-' + page);
  if (section) section.classList.add('active');

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + page + "'")) {
      n.classList.add('active');
    }
  });

  const titles = {
    dashboard:     ['Dashboard', 'Vista general del negocio'],
    ventas:        ['Nueva Venta', 'Registrar productos y servicios vendidos'],
    productos:     ['Productos', 'Gesti\u00f3n de cat\u00e1logo de productos'],
    servicios:     ['Servicios', 'Cat\u00e1logo de servicios de la barber\u00eda'],
    clientes:      ['Clientes', 'Base de datos de clientes'],
    barberos:      ['Barberos', 'Equipo de trabajo'],
    citas:         ['Citas & Agenda', 'Gesti\u00f3n de citas y reservaciones'],
    reportes:      ['Reportes', 'An\u00e1lisis financiero y estad\u00edsticas'],
    inventario:    ['Inventario', 'Control de stock y existencias'],
    historial:     ['Historial de Ventas', 'Registro de todas las transacciones'],
    configuracion: ['Configuraci\u00f3n', 'Ajustes del sistema'],
  };

  const t = titles[page] || [page, ''];
  document.getElementById('page-title').textContent = t[0];
  document.getElementById('page-subtitle').textContent = t[1];
  currentPage = page;

  // Render espec\u00edfico por p\u00e1gina
  const renders = {
    dashboard:     renderDashboard,
    ventas:        renderVentasPage,
    productos:     renderProductsGrid,
    servicios:     renderServicesCatalog,
    clientes:      renderClients,
    barberos:      renderBarberos,
    citas:         () => renderCitas(currentCitaFilter),
    reportes:      renderReportes,
    inventario:    renderInventario,
    historial:     renderHistorial,
    configuracion: loadConfig,
  };

  if (renders[page]) renders[page]();

  // Cerrar sidebar en m\u00f3vil
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ============================================================
// 6. TOPBAR \u2014 FECHA Y HORA
// ============================================================
function updateTopbarDate() {
  const now = new Date();
  const days = ['Domingo','Lunes','Martes','Mi\u00e9rcoles','Jueves','Viernes','S\u00e1bado'];
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const str = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const el = document.getElementById('topbar-date');
  if (el) el.textContent = str;
}

function updateWelcomeMsg() {
  const h = new Date().getHours();
  const msg = h < 12 ? '\u2600\ufe0f Buenos d\u00edas, que tengas un excelente d\u00eda de trabajo.' :
              h < 18 ? '\ud83c\udf24\ufe0f Buenas tardes, sigue adelante con el negocio.' :
                       '\ud83c\udf19 Buenas noches, revisando el cierre del d\u00eda.';
  const el = document.getElementById('welcome-msg');
  if (el) el.textContent = msg;
}

// ============================================================
// 7. DASHBOARD
// ============================================================
function renderDashboard() {
  updateWelcomeMsg();

  const thisMonth = new Date().toISOString().slice(0, 7);
  const todayStr  = today();

  // Ventas del mes
  const ventasMes = state.ventas.filter(v => v.fecha && v.fecha.startsWith(thisMonth));
  const ingresosMes = ventasMes.reduce((a, v) => a + (parseFloat(v.total) || 0), 0);

  // Ventas de hoy
  const ventasHoy = state.ventas.filter(v => v.fecha === todayStr);
  const ingresosHoy = ventasHoy.reduce((a, v) => a + (parseFloat(v.total) || 0), 0);

  // Citas de hoy
  const citasHoy = state.citas.filter(c => c.fecha === todayStr).length;

  // Stats cards
  setInner('stat-ingresos', fmtMoney(ingresosMes));
  setInner('stat-ventas', ventasMes.length);
  setInner('stat-clientes', state.clientes.length);
  setInner('stat-productos', state.productos.length);

  // Banner
  setInner('banner-ventas-hoy', fmtMoney(ingresosHoy));
  setInner('banner-citas-hoy', citasHoy);
  setInner('banner-clientes', state.clientes.length);
  setInner('banner-productos', state.productos.length);

  // Stock badge
  const lowStock = state.productos.filter(p => p.stock <= (p.stockMin || state.config.stockMin));
  if (lowStock.length > 0) {
    setInner('change-stock', '\u26a0\ufe0f ' + lowStock.length + ' bajo');
  }

  renderChartGanancias();
  renderChartCategorias();
  renderChartSemanal();
  renderTopProductos();
  renderUltimasVentas();
  renderAlertasInventario();
}

function setInner(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ============================================================
// 8. GR\u00c1FICAS
// ============================================================
function getMonthlyData() {
  const months = [];
  const labels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const year = new Date().getFullYear();
  const totals = Array(12).fill(0);

  state.ventas.forEach(v => {
    if (!v.fecha) return;
    const d = new Date(v.fecha + 'T00:00:00');
    if (d.getFullYear() === year) {
      totals[d.getMonth()] += parseFloat(v.total) || 0;
    }
  });

  return { labels: labels.map((l, i) => l + ' ' + year), data: totals };
}

function renderChartGanancias() {
  const ctx = document.getElementById('chartGanancias');
  if (!ctx) return;
  const { labels, data } = getMonthlyData();

  if (chartGanancias) chartGanancias.destroy();

  chartGanancias = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels,
      datasets: [{
        label: 'Ganancias',
        data,
        backgroundColor: currentChartType === 'line'
          ? 'rgba(200,169,81,0.12)'
          : data.map((_, i) => i === new Date().getMonth()
              ? 'rgba(200,169,81,0.9)'
              : 'rgba(200,169,81,0.45)'),
        borderColor: '#c8a951',
        borderWidth: 2.5,
        borderRadius: currentChartType === 'bar' ? 8 : 0,
        fill: currentChartType === 'line',
        tension: 0.4,
        pointBackgroundColor: '#c8a951',
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + fmtMoney(ctx.parsed.y)
          },
          backgroundColor: '#1a1a2e',
          padding: 12,
          cornerRadius: 10,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            callback: v => fmtMoney(v),
            font: { family: 'Poppins', size: 11 }
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Poppins', size: 11 } }
        }
      }
    }
  });
}

function renderChartCategorias() {
  const ctx = document.getElementById('chartCategorias');
  if (!ctx) return;

  // Contar ventas por categor\u00eda (servicios + productos)
  const cats = {};
  state.ventas.forEach(v => {
    (v.items || []).forEach(item => {
      const cat = item.tipo === 'servicio' ? 'Servicios' : (item.categoria || 'Producto');
      cats[cat] = (cats[cat] || 0) + (parseFloat(item.precio) * (item.qty || 1));
    });
  });

  const labels = Object.keys(cats);
  const data = Object.values(cats);

  if (chartCategorias) chartCategorias.destroy();

  chartCategorias = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['Sin datos'],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: ['#c8a951','#1a1a2e','#3498db','#2ecc71','#e74c3c','#f39c12','#9b59b6','#1abc9c'],
        borderWidth: 0,
        hoverOffset: 10,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { family: 'Poppins', size: 11 }, padding: 14, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + fmtMoney(ctx.parsed)
          }
        }
      }
    }
  });
}

function renderChartSemanal() {
  const ctx = document.getElementById('chartSemanal');
  if (!ctx) return;

  const days = ['Dom','Lun','Mar','Mi\u00e9','Jue','Vie','S\u00e1b'];
  const totals = Array(7).fill(0);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  state.ventas.forEach(v => {
    if (!v.fecha) return;
    const d = new Date(v.fecha + 'T00:00:00');
    const diff = Math.floor((d - weekStart) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      totals[diff] += parseFloat(v.total) || 0;
    }
  });

  if (chartSemanal) chartSemanal.destroy();

  chartSemanal = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Ventas',
        data: totals,
        backgroundColor: days.map((_, i) => i === now.getDay() ? '#c8a951' : 'rgba(200,169,81,0.3)'),
        borderRadius: 6,
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ' ' + fmtMoney(ctx.parsed.y) }
        }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => fmtMoney(v), font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

function toggleChartType() {
  currentChartType = currentChartType === 'bar' ? 'line' : currentChartType === 'line' ? 'bar' : 'bar';
  renderChartGanancias();
}

function exportChartPNG() {
  const canvas = document.getElementById('chartGanancias');
  if (!canvas) return;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'ganancias_colocho.png';
  a.click();
  showToast('success', 'Imagen exportada', 'Gr\u00e1fica guardada como PNG');
}

// ============================================================
// 9. TOP PRODUCTOS + \u00daLTIMAS VENTAS + ALERTAS
// ============================================================
function renderTopProductos() {
  const counts = {};
  state.ventas.forEach(v => {
    (v.items || []).forEach(item => {
      counts[item.nombre] = (counts[item.nombre] || 0) + (item.qty || 1);
    });
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const container = document.getElementById('top-productos-list');
  if (!container) return;

  if (sorted.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:20px"><div style="font-size:36px">\ud83d\udce6</div><p style="font-size:13px;color:#95a5a6">Realiza ventas para ver ranking</p></div>`;
    return;
  }

  const max = sorted[0][1];
  container.innerHTML = sorted.map(([name, qty], i) => `
    <div class="progress-item">
      <div class="progress-label">
        <span>${['\ud83e\udd47','\ud83e\udd48','\ud83e\udd49','4\ufe0f\u20e3','5\ufe0f\u20e3'][i]} ${name}</span>
        <span>${qty} vendidos</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width:${(qty/max)*100}%"></div>
      </div>
    </div>
  `).join('');
}

function renderUltimasVentas() {
  const tbody = document.getElementById('tbody-ultimas-ventas');
  if (!tbody) return;

  const last = [...state.ventas].reverse().slice(0, 6);
  if (last.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#b2bec3;">Sin ventas registradas</td></tr>`;
    return;
  }

  tbody.innerHTML = last.map(v => `
    <tr style="cursor:pointer;" onclick="showVentaDetalle('${v.id}')">
      <td><strong>#${v.numero || '\u2014'}</strong></td>
      <td>${v.cliente || 'Consumidor final'}</td>
      <td>${(v.items || []).length} item(s)</td>
      <td><strong style="color:#9a7a2e">${fmtMoney(v.total)}</strong></td>
      <td><span class="badge badge-success">\u2705 Completada</span></td>
    </tr>
  `).join('');
}

function renderAlertasInventario() {
  const container = document.getElementById('alertas-inventario');
  if (!container) return;

  const low = state.productos.filter(p => parseInt(p.stock) <= (parseInt(p.stockMin) || parseInt(state.config.stockMin) || 5));

  if (low.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:20px"><div style="font-size:36px">\u2705</div><p style="font-size:13px;color:#95a5a6">Stock en buen estado</p></div>`;
    return;
  }

  container.innerHTML = low.map(p => `
    <div class="alert-item ${parseInt(p.stock) === 0 ? 'critical' : ''}">
      <span style="font-size:24px">${p.emoji || '\ud83d\udce6'}</span>
      <div>
        <strong style="font-size:13px">${p.nombre}</strong><br>
        <span style="font-size:12px;color:#636e72">Stock: <b>${p.stock}</b> / M\u00edn: ${p.stockMin || 5}</span>
      </div>
      <span class="badge ${parseInt(p.stock) === 0 ? 'badge-danger' : 'badge-warning'}" style="margin-left:auto">
        ${parseInt(p.stock) === 0 ? 'Agotado' : 'Bajo'}
      </span>
    </div>
  `).join('');
}

// ============================================================
// 10. PRODUCTOS
// ============================================================
let prodCatFilter = '';
let prodSearch = '';

function renderProductsGrid() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  let filtered = state.productos;
  if (prodCatFilter) filtered = filtered.filter(p => p.categoria === prodCatFilter);
  if (prodSearch) filtered = filtered.filter(p =>
    p.nombre.toLowerCase().includes(prodSearch.toLowerCase()) ||
    (p.marca || '').toLowerCase().includes(prodSearch.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">\ud83d\udce6</div><h3>Sin productos</h3><p>Agrega tu primer producto</p></div>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-card-img">${p.emoji || categoryEmoji(p.categoria)}</div>
      <div class="product-card-body">
        <h4>${p.nombre}</h4>
        <div class="product-cat">${p.categoria}${p.marca ? ' \u00b7 ' + p.marca : ''}</div>
        <div class="product-price">${fmtMoney(p.precio)} <span>/ unidad</span></div>
        <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;">
          <span class="badge ${parseInt(p.stock) === 0 ? 'badge-danger' : parseInt(p.stock) <= (p.stockMin || 5) ? 'badge-warning' : 'badge-success'}">
            \ud83d\udce6 ${p.stock} en stock
          </span>
          ${p.costo ? `<span style="font-size:11px;color:#95a5a6">Costo: ${fmtMoney(p.costo)}</span>` : ''}
        </div>
      </div>
      <div class="product-card-footer">
        <button class="btn btn-primary btn-sm" onclick="editProduct('${p.id}')">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteProduct('${p.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function setProdCat(cat, btn) {
  prodCatFilter = cat;
  document.querySelectorAll('#prod-cat-filters .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProductsGrid();
}

function filterProducts() {
  prodSearch = document.getElementById('search-product')?.value || '';
  renderProductsGrid();
}

function saveProduct() {
  const editId = document.getElementById('edit-product-id')?.value;
  const nombre = document.getElementById('p-nombre')?.value.trim();
  const categoria = document.getElementById('p-categoria')?.value;
  const precio = parseFloat(document.getElementById('p-precio')?.value) || 0;
  const costo = parseFloat(document.getElementById('p-costo')?.value) || 0;
  const stock = parseInt(document.getElementById('p-stock')?.value) || 0;
  const stockMin = parseInt(document.getElementById('p-stock-min')?.value) || 5;
  const emoji = document.getElementById('p-emoji')?.value || categoryEmoji(categoria);
  const marca = document.getElementById('p-marca')?.value.trim();
  const descripcion = document.getElementById('p-descripcion')?.value.trim();

  if (!nombre) { showToast('error', 'Error', 'El nombre es obligatorio'); return; }
  if (precio <= 0) { showToast('error', 'Error', 'El precio debe ser mayor a 0'); return; }

  if (editId) {
    const idx = state.productos.findIndex(p => p.id === editId);
    if (idx >= 0) {
      state.productos[idx] = { ...state.productos[idx], nombre, categoria, precio, costo, stock, stockMin, emoji, marca, descripcion };
      showToast('success', '\u00a1Actualizado!', `${nombre} actualizado correctamente`);
    }
  } else {
    state.productos.push({ id: uid(), nombre, categoria, precio, costo, stock, stockMin, emoji, marca, descripcion });
    showToast('success', '\u00a1Producto agregado!', `${nombre} guardado exitosamente`);
  }

  save('productos');
  closeModal('modal-add-product');
  renderProductsGrid();
  updateBadges();
  updateSaleFilters();
}

function editProduct(id) {
  const p = state.productos.find(x => x.id === id);
  if (!p) return;
  document.getElementById('edit-product-id').value = p.id;
  document.getElementById('p-nombre').value = p.nombre;
  document.getElementById('p-categoria').value = p.categoria;
  document.getElementById('p-precio').value = p.precio;
  document.getElementById('p-costo').value = p.costo || '';
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('p-stock-min').value = p.stockMin || 5;
  document.getElementById('p-emoji').value = p.emoji || '';
  document.getElementById('p-marca').value = p.marca || '';
  document.getElementById('p-descripcion').value = p.descripcion || '';
  openModal('modal-add-product');
}

function deleteProduct(id) {
  if (!confirm('\u00bfEliminar este producto?')) return;
  state.productos = state.productos.filter(p => p.id !== id);
  save('productos');
  renderProductsGrid();
  showToast('success', 'Eliminado', 'Producto eliminado');
}

// ============================================================
// 11. SERVICIOS
// ============================================================
function renderServicesCatalog() {
  const container = document.getElementById('services-catalog-grid');
  if (!container) return;

  if (state.servicios.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">\u2702\ufe0f</div><h3>Sin servicios</h3><p>Agrega servicios</p></div>`;
    return;
  }

  container.innerHTML = state.servicios.map(s => `
    <div class="product-card">
      <div class="product-card-img">${s.emoji || '\u2702\ufe0f'}</div>
      <div class="product-card-body">
        <h4>${s.nombre}</h4>
        <div class="product-cat">Servicio${s.duracion ? ' \u00b7 ' + s.duracion + ' min' : ''}</div>
        <div class="product-price">${fmtMoney(s.precio)}</div>
        ${s.descripcion ? `<p style="font-size:11.5px;color:#95a5a6;margin-top:4px;">${s.descripcion}</p>` : ''}
      </div>
      <div class="product-card-footer">
        <button class="btn btn-primary btn-sm" onclick="editService('${s.id}')">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteService('${s.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function saveService() {
  const editId = document.getElementById('edit-service-id')?.value;
  const nombre = document.getElementById('s-nombre')?.value.trim();
  const precio = parseFloat(document.getElementById('s-precio')?.value) || 0;
  const duracion = parseInt(document.getElementById('s-duracion')?.value) || 30;
  const emoji = document.getElementById('s-emoji')?.value || '\u2702\ufe0f';
  const descripcion = document.getElementById('s-descripcion')?.value.trim();

  if (!nombre) { showToast('error', 'Error', 'El nombre es obligatorio'); return; }
  if (precio <= 0) { showToast('error', 'Error', 'El precio debe ser mayor a 0'); return; }

  if (editId) {
    const idx = state.servicios.findIndex(s => s.id === editId);
    if (idx >= 0) state.servicios[idx] = { ...state.servicios[idx], nombre, precio, duracion, emoji, descripcion };
    showToast('success', '\u00a1Actualizado!', `${nombre} actualizado`);
  } else {
    state.servicios.push({ id: uid(), nombre, precio, duracion, emoji, descripcion });
    showToast('success', '\u00a1Servicio agregado!', `${nombre} guardado`);
  }

  save('servicios');
  closeModal('modal-add-service');
  renderServicesCatalog();
}

function editService(id) {
  const s = state.servicios.find(x => x.id === id);
  if (!s) return;
  document.getElementById('edit-service-id').value = s.id;
  document.getElementById('s-nombre').value = s.nombre;
  document.getElementById('s-precio').value = s.precio;
  document.getElementById('s-duracion').value = s.duracion || 30;
  document.getElementById('s-emoji').value = s.emoji || '\u2702\ufe0f';
  document.getElementById('s-descripcion').value = s.descripcion || '';
  openModal('modal-add-service');
}

function deleteService(id) {
  if (!confirm('\u00bfEliminar este servicio?')) return;
  state.servicios = state.servicios.filter(s => s.id !== id);
  save('servicios');
  renderServicesCatalog();
  showToast('success', 'Eliminado', 'Servicio eliminado');
}

// ============================================================
// 12. VENTAS \u2014 CARRITO
// ============================================================
let saleCatFilter = '';

function renderVentasPage() {
  renderServicesInSale();
  renderProductsInSale();
  updateSaleFilters();
  updateClientDatalist();
  updateBarberSelect('venta-barbero');
  renderCartUI();
}

function renderServicesInSale() {
  const container = document.getElementById('services-grid');
  if (!container) return;
  container.innerHTML = state.servicios.map(s => {
    const inCart = cart.some(c => c.id === s.id);
    return `
    <div class="service-item ${inCart ? 'selected' : ''}" onclick="addToCart('service','${s.id}')">
      <div class="service-icon">${s.emoji || '\u2702\ufe0f'}</div>
      <h4>${s.nombre}</h4>
      <div class="service-price">${fmtMoney(s.precio)}</div>
      ${s.duracion ? `<div style="font-size:11px;color:#95a5a6;margin-top:3px;">\u23f1 ${s.duracion} min</div>` : ''}
    </div>`;
  }).join('');
}

function renderProductsInSale() {
  const container = document.getElementById('sale-products-grid');
  if (!container) return;
  let filtered = state.productos;
  if (saleCatFilter) filtered = filtered.filter(p => p.categoria === saleCatFilter);
  const q = document.getElementById('search-sale-product')?.value.toLowerCase() || '';
  if (q) filtered = filtered.filter(p => p.nombre.toLowerCase().includes(q) || (p.marca||'').toLowerCase().includes(q));

  container.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="addToCart('product','${p.id}')" style="cursor:pointer">
      <div class="product-card-img">${p.emoji || categoryEmoji(p.categoria)}</div>
      <div class="product-card-body">
        <h4>${p.nombre}</h4>
        <div class="product-cat">${p.categoria}</div>
        <div class="product-price">${fmtMoney(p.precio)}</div>
        <span class="badge ${parseInt(p.stock) === 0 ? 'badge-danger' : 'badge-success'}" style="margin-top:5px">
          ${parseInt(p.stock) === 0 ? '\u274c Agotado' : '\ud83d\udce6 ' + p.stock}
        </span>
      </div>
    </div>
  `).join('');
}

function updateSaleFilters() {
  const container = document.getElementById('sale-cat-filters');
  if (!container) return;
  const cats = [...new Set(state.productos.map(p => p.categoria))];
  const buttons = cats.map(c => `<button class="filter-btn" onclick="setSaleCat('${c}',this)">${categoryEmoji(c)} ${c}</button>`).join('');
  container.innerHTML = `<button class="filter-btn ${!saleCatFilter ? 'active' : ''}" onclick="setSaleCat('',this)">Todos</button>` + buttons;
}

function setSaleCat(cat, btn) {
  saleCatFilter = cat;
  document.querySelectorAll('#sale-cat-filters .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProductsInSale();
}

function filterSaleProducts() {
  renderProductsInSale();
}

function addToCart(type, id) {
  let item;
  if (type === 'service') {
    const s = state.servicios.find(x => x.id === id);
    if (!s) return;
    item = { id: s.id, tipo: 'servicio', nombre: s.nombre, precio: s.precio, qty: 1, emoji: s.emoji || '\u2702\ufe0f' };
  } else {
    const p = state.productos.find(x => x.id === id);
    if (!p) return;
    if (parseInt(p.stock) <= 0) { showToast('error', 'Sin stock', `${p.nombre} est\u00e1 agotado`); return; }
    item = { id: p.id, tipo: 'producto', nombre: p.nombre, precio: p.precio, qty: 1, emoji: p.emoji || '\ud83d\udce6', categoria: p.categoria };
  }

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push(item);
  }

  renderCartUI();
  renderServicesInSale();
  updateBadges();
  showToast('success', 'Agregado', `${item.nombre} al carrito`);
}

function updateCartQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx < 0) return;
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  renderCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  renderCartUI();
  renderServicesInSale();
  updateBadges();
}

function clearCart() {
  cart = [];
  document.getElementById('descuento').value = 0;
  document.getElementById('apply-iva').checked = false;
  renderCartUI();
  renderServicesInSale();
  updateBadges();
}

function renderCartUI() {
  const container = document.getElementById('cart-items-container');
  const emptyEl = document.getElementById('cart-empty');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:30px" id="cart-empty"><div class="empty-icon">\ud83d\uded2</div><p>Agrega productos o servicios</p></div>`;
    updateCartTotals();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.emoji}</div>
      <div class="cart-item-info">
        <h4>${item.nombre}</h4>
        <span>${fmtMoney(item.precio)} c/u</span>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="updateCartQty('${item.id}',-1)">\u2212</button>
        <span style="font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
        <button class="qty-btn" onclick="updateCartQty('${item.id}',1)">+</button>
      </div>
      <div class="cart-item-price">${fmtMoney(item.precio * item.qty)}</div>
      <button onclick="removeFromCart('${item.id}')" style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:16px;padding:0 4px;">\u2715</button>
    </div>
  `).join('');

  updateCartTotals();
}

function updateCartTotals() {
  const subtotal = cart.reduce((a, c) => a + (c.precio * c.qty), 0);
  const descPct = parseFloat(document.getElementById('descuento')?.value) || 0;
  const applyIva = document.getElementById('apply-iva')?.checked || false;
  const desc = subtotal * (descPct / 100);
  const base = subtotal - desc;
  const iva = applyIva ? base * 0.12 : 0;
  const total = base + iva;

  setInner('cart-subtotal', fmtMoney(subtotal));
  setInner('cart-total', fmtMoney(total));
}

function processSale() {
  if (cart.length === 0) { showToast('error', 'Carrito vac\u00edo', 'Agrega al menos un item'); return; }

  const cliente = document.getElementById('venta-cliente')?.value.trim() || 'Consumidor final';
  const barbero = document.getElementById('venta-barbero')?.value || 'Sin asignar';
  const metodoPago = document.getElementById('metodo-pago')?.value || 'Efectivo';
  const nota = document.getElementById('venta-nota')?.value.trim() || '';
  const descPct = parseFloat(document.getElementById('descuento')?.value) || 0;
  const applyIva = document.getElementById('apply-iva')?.checked || false;

  const subtotal = cart.reduce((a, c) => a + (c.precio * c.qty), 0);
  const descVal = subtotal * (descPct / 100);
  const base = subtotal - descVal;
  const ivaVal = applyIva ? base * 0.12 : 0;
  const total = base + ivaVal;

  // Descontar stock de productos
  cart.forEach(item => {
    if (item.tipo === 'producto') {
      const prod = state.productos.find(p => p.id === item.id);
      if (prod) prod.stock = Math.max(0, parseInt(prod.stock) - item.qty);
    }
  });
  save('productos');

  const venta = {
    id: uid(),
    numero: (state.ventas.length > 0 ? Math.max(...state.ventas.map(v => v.numero || 0)) + 1 : 1),
    fecha: today(),
    hora: nowTime(),
    cliente,
    barbero,
    items: JSON.parse(JSON.stringify(cart)),
    subtotal,
    descuento: descPct,
    iva: ivaVal,
    total,
    metodoPago,
    nota,
    estado: 'completada'
  };

  state.ventas.push(venta);
  save('ventas');

  // Exportar a Excel autom\u00e1ticamente
  appendVentaToExcel(venta);

  showToast('success', '\ud83c\udf89 \u00a1Venta registrada!', `Total: ${fmtMoney(total)} | Cliente: ${cliente}`);
  clearCart();
  updateBadges();

  // Mostrar recibo
  showRecibo(venta);
}

// ============================================================
// 13. RECIBO
// ============================================================
function showRecibo(venta) {
  const content = document.getElementById('recibo-content');
  if (!content) return;

  content.innerHTML = `
    <div style="text-align:center;padding:20px 0 16px;border-bottom:2px dashed #e9ecef;margin-bottom:16px">
      <div style="font-size:40px;margin-bottom:8px">\u2702\ufe0f</div>
      <h2 style="font-family:'Playfair Display',serif;font-size:22px;color:#1a1a2e">BARBER\u00cdA EL COLOCHO</h2>
      <p style="font-size:12px;color:#95a5a6">${state.config.direccion || 'Tu barber\u00eda de confianza'}</p>
      <p style="font-size:12px;color:#95a5a6">${state.config.telefono || ''}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;font-size:13px;">
      <div><b>Recibo #:</b> ${venta.numero}</div>
      <div><b>Fecha:</b> ${fmtDate(venta.fecha)}</div>
      <div><b>Hora:</b> ${venta.hora}</div>
      <div><b>Pago:</b> ${venta.metodoPago}</div>
      <div><b>Cliente:</b> ${venta.cliente}</div>
      <div><b>Barbero:</b> ${venta.barbero}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px;">
      <thead>
        <tr style="background:#f8f9fa;">
          <th style="padding:8px;text-align:left;font-size:11px;color:#95a5a6;text-transform:uppercase">Item</th>
          <th style="padding:8px;text-align:center;font-size:11px;color:#95a5a6;text-transform:uppercase">Qty</th>
          <th style="padding:8px;text-align:right;font-size:11px;color:#95a5a6;text-transform:uppercase">Precio</th>
          <th style="padding:8px;text-align:right;font-size:11px;color:#95a5a6;text-transform:uppercase">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(venta.items || []).map(item => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #f0f0f0">${item.emoji || ''} ${item.nombre}</td>
            <td style="padding:8px;text-align:center;border-bottom:1px solid #f0f0f0">${item.qty}</td>
            <td style="padding:8px;text-align:right;border-bottom:1px solid #f0f0f0">${fmtMoney(item.precio)}</td>
            <td style="padding:8px;text-align:right;border-bottom:1px solid #f0f0f0"><b>${fmtMoney(item.precio * item.qty)}</b></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="font-size:13px;border-top:1px solid #e9ecef;padding-top:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span>Subtotal</span><span>${fmtMoney(venta.subtotal)}</span></div>
      ${venta.descuento > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:5px;color:#e74c3c"><span>Descuento (${venta.descuento}%)</span><span>-${fmtMoney(venta.subtotal * venta.descuento / 100)}</span></div>` : ''}
      ${venta.iva > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span>IVA (12%)</span><span>${fmtMoney(venta.iva)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:800;color:#1a1a2e;border-top:2px solid #1a1a2e;padding-top:10px;margin-top:5px;">
        <span>TOTAL</span><span style="color:#9a7a2e">${fmtMoney(venta.total)}</span>
      </div>
    </div>
    <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:2px dashed #e9ecef;font-size:12px;color:#95a5a6;">
      <p>\u00a1Gracias por su preferencia!</p>
      <p>Barber\u00eda El Colocho \u2014 Tu look, nuestra pasi\u00f3n \u2702\ufe0f</p>
    </div>
  `;
  openModal('modal-recibo');
}

function printReceipt() {
  if (cart.length === 0) { showToast('error', 'Carrito vac\u00edo', 'Agrega items primero'); return; }
  window.print();
}

// ============================================================
// 14. CLIENTES
// ============================================================
let clientSearch = '';

function renderClients() {
  const container = document.getElementById('clients-list');
  if (!container) return;

  let filtered = state.clientes;
  if (clientSearch) filtered = filtered.filter(c =>
    c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.telefono || '').includes(clientSearch)
  );

  setInner('metric-total-clients', state.clientes.length);

  const thisMonth = new Date().toISOString().slice(0, 7);
  setInner('metric-new-clients', state.clientes.filter(c => c.fechaRegistro && c.fechaRegistro.startsWith(thisMonth)).length);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\ud83d\udc65</div><h3>Sin clientes</h3><p>Agrega tu primer cliente</p></div>`;
    renderTopClients();
    return;
  }

  // Visitas por cliente
  const visits = {};
  state.ventas.forEach(v => {
    if (v.cliente) visits[v.cliente] = (visits[v.cliente] || 0) + 1;
  });

  container.innerHTML = filtered.map(c => `
    <div class="client-card">
      <div class="client-avatar">${getInitials(c.nombre)}</div>
      <div class="client-info">
        <h4>${c.nombre}</h4>
        <span>${c.telefono || 'Sin tel\u00e9fono'} ${c.email ? '\u00b7 ' + c.email : ''}</span>
        ${c.notas ? `<p style="font-size:11.5px;color:#636e72;margin-top:3px;">\ud83d\udcdd ${c.notas}</p>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0">
        <span class="badge badge-gold">${visits[c.nombre] || 0} visitas</span>
        <br/>
        <span style="font-size:11px;color:#b2bec3;margin-top:4px;display:block">${fmtDate(c.fechaRegistro)}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-left:8px;">
        <button class="btn btn-secondary btn-sm btn-icon" onclick="editClient('${c.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteClient('${c.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  renderTopClients();
}

function renderTopClients() {
  const container = document.getElementById('top-clients-list');
  if (!container) return;
  const visits = {};
  state.ventas.forEach(v => {
    if (v.cliente && v.cliente !== 'Consumidor final')
      visits[v.cliente] = (visits[v.cliente] || 0) + parseFloat(v.total || 0);
  });
  const sorted = Object.entries(visits).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!sorted.length) { container.innerHTML = `<p style="font-size:13px;color:#b2bec3;text-align:center;padding:10px">Sin datos</p>`; return; }
  container.innerHTML = sorted.map(([name, total], i) => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#1a1a2e,#16213e);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#c8a951">${i+1}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:600">${name}</div></div>
      <span class="badge badge-gold">${fmtMoney(total)}</span>
    </div>
  `).join('');
}

function filterClients() {
  clientSearch = document.getElementById('search-client')?.value || '';
  renderClients();
}

function saveClient() {
  const editId = document.getElementById('edit-client-id')?.value;
  const nombre = document.getElementById('c-nombre')?.value.trim();
  const telefono = document.getElementById('c-telefono')?.value.trim();
  const email = document.getElementById('c-email')?.value.trim();
  const nacimiento = document.getElementById('c-nacimiento')?.value;
  const notas = document.getElementById('c-notas')?.value.trim();

  if (!nombre) { showToast('error', 'Error', 'El nombre es obligatorio'); return; }

  if (editId) {
    const idx = state.clientes.findIndex(c => c.id === editId);
    if (idx >= 0) state.clientes[idx] = { ...state.clientes[idx], nombre, telefono, email, nacimiento, notas };
    showToast('success', '\u00a1Actualizado!', `${nombre} actualizado`);
  } else {
    state.clientes.push({ id: uid(), nombre, telefono, email, nacimiento, notas, fechaRegistro: today() });
    showToast('success', '\u00a1Cliente agregado!', `${nombre} guardado`);
  }

  save('clientes');
  closeModal('modal-add-client');
  renderClients();
  updateClientDatalist();
}

function editClient(id) {
  const c = state.clientes.find(x => x.id === id);
  if (!c) return;
  document.getElementById('edit-client-id').value = c.id;
  document.getElementById('c-nombre').value = c.nombre;
  document.getElementById('c-telefono').value = c.telefono || '';
  document.getElementById('c-email').value = c.email || '';
  document.getElementById('c-nacimiento').value = c.nacimiento || '';
  document.getElementById('c-notas').value = c.notas || '';
  openModal('modal-add-client');
}

function deleteClient(id) {
  if (!confirm('\u00bfEliminar este cliente?')) return;
  state.clientes = state.clientes.filter(c => c.id !== id);
  save('clientes');
  renderClients();
  showToast('success', 'Eliminado', 'Cliente eliminado');
}

function updateClientDatalist() {
  ['clientes-datalist', 'clientes-datalist2'].forEach(dlId => {
    const dl = document.getElementById(dlId);
    if (dl) dl.innerHTML = state.clientes.map(c => `<option value="${c.nombre}">`).join('');
  });
}

// ============================================================
// 15. BARBEROS
// ============================================================
function renderBarberos() {
  const container = document.getElementById('barberos-grid');
  if (!container) return;

  if (state.barberos.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">\ud83d\udc88</div><h3>Sin barberos</h3></div>`;
    return;
  }

  const ventasPorBarbero = {};
  state.ventas.forEach(v => {
    if (v.barbero) ventasPorBarbero[v.barbero] = (ventasPorBarbero[v.barbero] || 0) + parseFloat(v.total || 0);
  });

  container.innerHTML = state.barberos.map(b => `
    <div class="card" style="padding:24px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#1a1a2e,#16213e);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#c8a951;flex-shrink:0">${getInitials(b.nombre)}</div>
        <div>
          <h3 style="font-size:15px;font-weight:700">${b.nombre}</h3>
          <span style="font-size:12px;color:#95a5a6">${b.especialidad || 'Barbero'}</span>
        </div>
        <span class="badge badge-success" style="margin-left:auto">\u2705 Activo</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;margin-bottom:16px">
        <div style="background:#f8f9fa;padding:10px;border-radius:10px">
          <div style="font-size:10px;color:#95a5a6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Ventas</div>
          <strong style="color:#9a7a2e">${fmtMoney(ventasPorBarbero[b.nombre] || 0)}</strong>
        </div>
        <div style="background:#f8f9fa;padding:10px;border-radius:10px">
          <div style="font-size:10px;color:#95a5a6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Comisi\u00f3n</div>
          <strong>${b.comision || 0}%</strong>
        </div>
      </div>
      ${b.telefono ? `<p style="font-size:12.5px;color:#636e72;margin-bottom:12px">\ud83d\udcde ${b.telefono}</p>` : ''}
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary btn-sm" onclick="editBarbero('${b.id}')"><i class="fas fa-edit"></i> Editar</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteBarbero('${b.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function updateBarberSelect(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = `<option value="">Seleccionar barbero...</option>` +
    state.barberos.map(b => `<option value="${b.nombre}" ${b.nombre === current ? 'selected' : ''}>${b.nombre}</option>`).join('');
}

function saveBarbero() {
  const editId = document.getElementById('edit-barbero-id')?.value;
  const nombre = document.getElementById('b-nombre')?.value.trim();
  const especialidad = document.getElementById('b-especialidad')?.value.trim();
  const telefono = document.getElementById('b-telefono')?.value.trim();
  const comision = parseFloat(document.getElementById('b-comision')?.value) || 0;

  if (!nombre) { showToast('error', 'Error', 'El nombre es obligatorio'); return; }

  if (editId) {
    const idx = state.barberos.findIndex(b => b.id === editId);
    if (idx >= 0) state.barberos[idx] = { ...state.barberos[idx], nombre, especialidad, telefono, comision };
    showToast('success', '\u00a1Actualizado!', `${nombre} actualizado`);
  } else {
    state.barberos.push({ id: uid(), nombre, especialidad, telefono, comision, activo: true });
    showToast('success', '\u00a1Barbero agregado!', `${nombre} agregado al equipo`);
  }

  save('barberos');
  closeModal('modal-add-barbero');
  renderBarberos();
  updateBarberSelect('venta-barbero');
  updateBarberSelect('cita-barbero');
}

function editBarbero(id) {
  const b = state.barberos.find(x => x.id === id);
  if (!b) return;
  document.getElementById('edit-barbero-id').value = b.id;
  document.getElementById('b-nombre').value = b.nombre;
  document.getElementById('b-especialidad').value = b.especialidad || '';
  document.getElementById('b-telefono').value = b.telefono || '';
  document.getElementById('b-comision').value = b.comision || 0;
  openModal('modal-add-barbero');
}

function deleteBarbero(id) {
  if (!confirm('\u00bfEliminar este barbero?')) return;
  state.barberos = state.barberos.filter(b => b.id !== id);
  save('barberos');
  renderBarberos();
  showToast('success', 'Eliminado', 'Barbero eliminado');
}

// ============================================================
// 16. CITAS
// ============================================================
function renderCitas(filter) {
  currentCitaFilter = filter;
  const container = document.getElementById('citas-list');
  if (!container) return;

  const todayStr = today();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  let filtered = [...state.citas].sort((a, b) => {
    if (a.fecha < b.fecha) return -1;
    if (a.fecha > b.fecha) return 1;
    return (a.hora || '').localeCompare(b.hora || '');
  });

  if (filter === 'hoy') filtered = filtered.filter(c => c.fecha === todayStr);
  else if (filter === 'manana') filtered = filtered.filter(c => c.fecha === tomorrowStr);
  else if (filter === 'semana') filtered = filtered.filter(c => c.fecha >= todayStr && c.fecha <= weekEndStr);

  // Group by date
  const groups = {};
  filtered.forEach(c => {
    const k = c.fecha || 'sin-fecha';
    if (!groups[k]) groups[k] = [];
    groups[k].push(c);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\ud83d\udcc5</div><h3>Sin citas</h3><p>No hay citas para este per\u00edodo</p></div>`;
  } else {
    container.innerHTML = Object.entries(groups).map(([date, citas]) => `
      <div class="appt-day-header">${fmtDate(date)} <span style="font-size:11px;font-weight:400;color:#95a5a6">(${citas.length} cita${citas.length > 1 ? 's' : ''})</span></div>
      ${citas.map(c => `
        <div class="appt-item ${c.estado}">
          <div class="appt-time">\u23f0 ${c.hora}</div>
          <div class="appt-info" style="flex:1">
            <h4>${c.cliente}</h4>
            <span>${c.servicio || 'Sin servicio'} \u00b7 ${c.barbero || 'Sin barbero'}</span>
            ${c.notas ? `<p style="font-size:11px;color:#95a5a6;margin-top:2px">\ud83d\udcdd ${c.notas}</p>` : ''}
          </div>
          <span class="badge ${c.estado === 'confirmed' ? 'badge-success' : c.estado === 'cancelled' ? 'badge-danger' : 'badge-warning'}">
            ${c.estado === 'confirmed' ? '\u2705 Confirmada' : c.estado === 'cancelled' ? '\u274c Cancelada' : '\u23f3 Pendiente'}
          </span>
          <div style="display:flex;gap:5px;margin-left:8px">
            <button class="btn btn-secondary btn-sm btn-icon" onclick="editCita('${c.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteCita('${c.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('')}
    `).join('');
  }

  // Summary
  const summaryEl = document.getElementById('citas-summary');
  if (summaryEl) {
    const stats = {
      total: state.citas.length,
      hoy: state.citas.filter(c => c.fecha === todayStr).length,
      confirmadas: state.citas.filter(c => c.estado === 'confirmed').length,
      pendientes: state.citas.filter(c => c.estado === 'pending').length
    };
    summaryEl.innerHTML = [
      ['Total citas', stats.total, 'badge-dark'],
      ['Hoy', stats.hoy, 'badge-info'],
      ['Confirmadas', stats.confirmadas, 'badge-success'],
      ['Pendientes', stats.pendientes, 'badge-warning'],
    ].map(([label, val, cls]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f0">
        <span style="font-size:13px;color:#636e72">${label}</span>
        <span class="badge ${cls}">${val}</span>
      </div>
    `).join('');
  }

  updateBadgeCitas();
}

function filterCitas(filter, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCitas(filter);
}

function saveCita() {
  const editId = document.getElementById('edit-cita-id')?.value;
  const cliente = document.getElementById('cita-cliente')?.value.trim();
  const barbero = document.getElementById('cita-barbero')?.value;
  const fecha = document.getElementById('cita-fecha')?.value;
  const hora = document.getElementById('cita-hora')?.value;
  const servicio = document.getElementById('cita-servicio')?.value;
  const estado = document.getElementById('cita-estado')?.value;
  const notas = document.getElementById('cita-notas')?.value.trim();

  if (!cliente) { showToast('error', 'Error', 'El nombre del cliente es obligatorio'); return; }
  if (!fecha) { showToast('error', 'Error', 'La fecha es obligatoria'); return; }
  if (!hora) { showToast('error', 'Error', 'La hora es obligatoria'); return; }

  if (editId) {
    const idx = state.citas.findIndex(c => c.id === editId);
    if (idx >= 0) state.citas[idx] = { ...state.citas[idx], cliente, barbero, fecha, hora, servicio, estado, notas };
    showToast('success', '\u00a1Cita actualizada!', `${cliente} - ${fmtDate(fecha)}`);
  } else {
    state.citas.push({ id: uid(), cliente, barbero, fecha, hora, servicio, estado, notas });
    showToast('success', '\u00a1Cita agendada!', `${cliente} - ${fmtDate(fecha)} ${hora}`);
  }

  save('citas');
  closeModal('modal-add-cita');
  renderCitas(currentCitaFilter);
}

function editCita(id) {
  const c = state.citas.find(x => x.id === id);
  if (!c) return;
  document.getElementById('edit-cita-id').value = c.id;
  document.getElementById('cita-cliente').value = c.cliente;
  document.getElementById('cita-fecha').value = c.fecha;
  document.getElementById('cita-hora').value = c.hora;
  document.getElementById('cita-notas').value = c.notas || '';
  document.getElementById('cita-estado').value = c.estado;
  updateBarberSelect('cita-barbero');
  updateServicioSelect();
  document.getElementById('cita-barbero').value = c.barbero || '';
  document.getElementById('cita-servicio').value = c.servicio || '';
  openModal('modal-add-cita');
}

function deleteCita(id) {
  if (!confirm('\u00bfEliminar esta cita?')) return;
  state.citas = state.citas.filter(c => c.id !== id);
  save('citas');
  renderCitas(currentCitaFilter);
  showToast('success', 'Eliminada', 'Cita eliminada');
}

function updateServicioSelect() {
  const sel = document.getElementById('cita-servicio');
  if (!sel) return;
  sel.innerHTML = `<option value="">Seleccionar servicio...</option>` +
    state.servicios.map(s => `<option value="${s.nombre}">${s.nombre} - ${fmtMoney(s.precio)}</option>`).join('');
}

function updateBadgeCitas() {
  const todayStr = today();
  const pending = state.citas.filter(c => c.fecha === todayStr && c.estado === 'pending').length;
  const badge = document.getElementById('badge-citas');
  if (badge) badge.textContent = pending || 0;
}

// ============================================================
// 17. REPORTES
// ============================================================
function renderReportes() {
  const periodo = document.getElementById('reporte-periodo')?.value || 'mes';
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const thisYear = now.getFullYear().toString();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());

  let ventasFiltradas = state.ventas;
  if (periodo === 'mes') ventasFiltradas = state.ventas.filter(v => v.fecha && v.fecha.startsWith(thisMonth));
  else if (periodo === 'semana') ventasFiltradas = state.ventas.filter(v => {
    if (!v.fecha) return false;
    const d = new Date(v.fecha + 'T00:00:00');
    return d >= weekStart && d <= now;
  });
  else if (periodo === 'a\u00f1o') ventasFiltradas = state.ventas.filter(v => v.fecha && v.fecha.startsWith(thisYear));

  const totalIngresos = ventasFiltradas.reduce((a, v) => a + parseFloat(v.total || 0), 0);
  const totalVentas = ventasFiltradas.length;
  const promedio = totalVentas > 0 ? totalIngresos / totalVentas : 0;

  const metricsEl = document.getElementById('reportes-metrics');
  if (metricsEl) {
    metricsEl.innerHTML = [
      ['\ud83d\udcb5', 'Ingresos', fmtMoney(totalIngresos)],
      ['\ud83e\uddfe', 'Ventas', totalVentas],
      ['\ud83d\udcca', 'Promedio/Venta', fmtMoney(promedio)],
    ].map(([icon, label, val]) => `
      <div class="metric-card">
        <div style="font-size:28px;margin-bottom:6px">${icon}</div>
        <div class="metric-value">${val}</div>
        <div class="metric-label">${label}</div>
      </div>
    `).join('');
  }

  // Chart diario
  const dailyData = {};
  ventasFiltradas.forEach(v => {
    if (!v.fecha) return;
    dailyData[v.fecha] = (dailyData[v.fecha] || 0) + parseFloat(v.total || 0);
  });
  const sortedDates = Object.keys(dailyData).sort();

  const ctxDiario = document.getElementById('chartReporteDiario');
  if (ctxDiario) {
    if (chartReporteDiario) chartReporteDiario.destroy();
    chartReporteDiario = new Chart(ctxDiario, {
      type: 'line',
      data: {
        labels: sortedDates.map(d => fmtDate(d)),
        datasets: [{
          label: 'Ingresos',
          data: sortedDates.map(d => dailyData[d]),
          borderColor: '#c8a951',
          backgroundColor: 'rgba(200,169,81,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#c8a951',
          pointRadius: 4,
          borderWidth: 2.5,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + fmtMoney(c.parsed.y) } } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => fmtMoney(v), font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // Chart servicios vs productos
  let totalServicios = 0, totalProductos = 0;
  ventasFiltradas.forEach(v => {
    (v.items || []).forEach(item => {
      const val = item.precio * (item.qty || 1);
      if (item.tipo === 'servicio') totalServicios += val;
      else totalProductos += val;
    });
  });

  const ctxSvP = document.getElementById('chartServiciosVsProductos');
  if (ctxSvP) {
    if (chartServiciosVsProductos) chartServiciosVsProductos.destroy();
    chartServiciosVsProductos = new Chart(ctxSvP, {
      type: 'pie',
      data: {
        labels: ['Servicios', 'Productos'],
        datasets: [{
          data: [totalServicios, totalProductos],
          backgroundColor: ['#1a1a2e', '#c8a951'],
          borderWidth: 0,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 12 } } },
          tooltip: { callbacks: { label: c => ' ' + fmtMoney(c.parsed) } }
        }
      }
    });
  }

  // Tabla
  const tbody = document.getElementById('reportes-tabla');
  if (tbody) {
    if (ventasFiltradas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#b2bec3">Sin datos para este per\u00edodo</td></tr>`;
    } else {
      tbody.innerHTML = [...ventasFiltradas].reverse().map(v => `
        <tr onclick="showVentaDetalle('${v.id}')" style="cursor:pointer">
          <td><b>#${v.numero}</b></td>
          <td>${fmtDate(v.fecha)}</td>
          <td>${v.cliente || '\u2014'}</td>
          <td>${v.barbero || '\u2014'}</td>
          <td>${(v.items || []).length} item(s)</td>
          <td>${v.metodoPago || '\u2014'}</td>
          <td><b style="color:#9a7a2e">${fmtMoney(v.total)}</b></td>
          <td><span class="badge badge-success">\u2705</span></td>
        </tr>
      `).join('');
    }
  }
}

function updateReportes() { renderReportes(); }

// ============================================================
// 18. INVENTARIO
// ============================================================
function renderInventario() {
  const total = state.productos.length;
  const low = state.productos.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) <= (p.stockMin || 5)).length;
  const out = state.productos.filter(p => parseInt(p.stock) === 0).length;
  const ok = total - low - out;

  const statsEl = document.getElementById('inv-stats');
  if (statsEl) {
    statsEl.innerHTML = [
      ['\ud83d\udce6', 'Total Productos', total, '#c8a951'],
      ['\u2705', 'Stock Normal', ok, '#2ecc71'],
      ['\u26a0\ufe0f', 'Stock Bajo', low, '#f39c12'],
      ['\u274c', 'Agotados', out, '#e74c3c'],
      ['\ud83d\udcb0', 'Valor Inventario', fmtMoney(state.productos.reduce((a, p) => a + (p.precio * p.stock), 0)), '#3498db'],
      ['\ud83d\udcb5', 'Valor Costo', fmtMoney(state.productos.reduce((a, p) => a + ((p.costo || 0) * p.stock), 0)), '#9b59b6'],
    ].map(([icon, label, val, color]) => `
      <div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 16px rgba(0,0,0,.07);text-align:center">
        <div style="font-size:28px;margin-bottom:6px">${icon}</div>
        <div style="font-size:20px;font-weight:800;color:${color}">${val}</div>
        <div style="font-size:11.5px;color:#95a5a6;text-transform:uppercase;letter-spacing:.5px">${label}</div>
      </div>
    `).join('');
  }

  const tbody = document.getElementById('inventario-tbody');
  if (!tbody) return;
  if (state.productos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#b2bec3">Agrega productos primero</td></tr>`;
    return;
  }

  tbody.innerHTML = state.productos.map(p => {
    const s = parseInt(p.stock);
    const m = parseInt(p.stockMin) || 5;
    const statusClass = s === 0 ? 'badge-danger' : s <= m ? 'badge-warning' : 'badge-success';
    const statusText = s === 0 ? '\u274c Agotado' : s <= m ? '\u26a0\ufe0f Bajo' : '\u2705 Normal';
    return `
      <tr>
        <td><div style="display:flex;align-items:center;gap:8px"><span style="font-size:22px">${p.emoji || '\ud83d\udce6'}</span><div><strong>${p.nombre}</strong>${p.marca ? `<br><span style="font-size:11px;color:#95a5a6">${p.marca}</span>` : ''}</div></div></td>
        <td><span class="badge badge-dark">${p.categoria}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="number" value="${p.stock}" min="0" style="width:64px;padding:5px 8px;border:1.5px solid #e9ecef;border-radius:8px;font-size:13px;font-family:'Poppins',sans-serif" onchange="updateStock('${p.id}',this.value)" />
          </div>
        </td>
        <td>${p.stockMin || 5}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td><strong style="color:#9a7a2e">${fmtMoney(p.precio)}</strong></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateStock(id, val) {
  const prod = state.productos.find(p => p.id === id);
  if (prod) {
    prod.stock = parseInt(val) || 0;
    save('productos');
    showToast('success', 'Stock actualizado', `${prod.nombre}: ${prod.stock} unidades`);
  }
}

// ============================================================
// 19. HISTORIAL DE VENTAS
// ============================================================
function renderHistorial() {
  const tbody = document.getElementById('historial-tbody');
  const countEl = document.getElementById('historial-count');
  if (!tbody) return;

  const filterFecha = document.getElementById('filter-fecha')?.value || '';
  let filtered = [...state.ventas].reverse();
  if (filterFecha) filtered = filtered.filter(v => v.fecha === filterFecha);

  if (countEl) countEl.textContent = `${filtered.length} registros`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#b2bec3">Sin ventas registradas</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(v => `
    <tr style="cursor:pointer;" onclick="showVentaDetalle('${v.id}')">
      <td><strong style="color:#9a7a2e">#${v.numero}</strong></td>
      <td>${fmtDate(v.fecha)} <span style="font-size:11px;color:#95a5a6">\u23f0 ${v.hora || ''}</span></td>
      <td>${v.cliente || 'Consumidor final'}</td>
      <td>${v.barbero || '\u2014'}</td>
      <td>
        <div style="font-size:12px">
          ${(v.items || []).slice(0, 2).map(i => `${i.emoji || ''} ${i.nombre} x${i.qty}`).join(', ')}
          ${(v.items || []).length > 2 ? ` <span style="color:#95a5a6">+${v.items.length - 2} m\u00e1s</span>` : ''}
        </div>
      </td>
      <td>${v.metodoPago || '\u2014'}</td>
      <td><strong style="font-size:15px;color:#9a7a2e">${fmtMoney(v.total)}</strong></td>
      <td>
        <div style="display:flex;gap:5px">
          <button class="btn btn-primary btn-sm btn-icon" onclick="event.stopPropagation();exportSingleVentaExcelById('${v.id}')">
            <i class="fas fa-file-excel"></i>
          </button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="event.stopPropagation();deleteVenta('${v.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterHistorial() { renderHistorial(); }

function deleteVenta(id) {
  if (!confirm('\u00bfEliminar esta venta del historial?')) return;
  state.ventas = state.ventas.filter(v => v.id !== id);
  save('ventas');
  renderHistorial();
  showToast('success', 'Eliminada', 'Venta eliminada del historial');
}

function showVentaDetalle(id) {
  const v = state.ventas.find(x => x.id === id);
  if (!v) return;
  selectedVentaForExport = v;

  const content = document.getElementById('venta-detalle-content');
  if (!content) return;

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;font-size:13.5px;">
      <div><b>Venta #:</b> ${v.numero}</div>
      <div><b>Estado:</b> <span class="badge badge-success">\u2705 Completada</span></div>
      <div><b>Fecha:</b> ${fmtDate(v.fecha)}</div>
      <div><b>Hora:</b> ${v.hora || '\u2014'}</div>
      <div><b>Cliente:</b> ${v.cliente || '\u2014'}</div>
      <div><b>Barbero:</b> ${v.barbero || '\u2014'}</div>
      <div><b>M\u00e9todo de Pago:</b> ${v.metodoPago || '\u2014'}</div>
      ${v.nota ? `<div style="grid-column:1/-1"><b>Nota:</b> ${v.nota}</div>` : ''}
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
      <thead>
        <tr style="background:#f8f9fa">
          <th style="padding:10px;text-align:left;font-size:11px;color:#95a5a6;text-transform:uppercase">Tipo</th>
          <th style="padding:10px;text-align:left;font-size:11px;color:#95a5a6;text-transform:uppercase">Item</th>
          <th style="padding:10px;text-align:center">Qty</th>
          <th style="padding:10px;text-align:right">Precio Unit.</th>
          <th style="padding:10px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(v.items || []).map(item => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #f0f0f0"><span class="badge ${item.tipo === 'servicio' ? 'badge-info' : 'badge-gold'}">${item.tipo === 'servicio' ? '\u2702\ufe0f Servicio' : '\ud83d\udce6 Producto'}</span></td>
            <td style="padding:10px;border-bottom:1px solid #f0f0f0">${item.emoji || ''} ${item.nombre}</td>
            <td style="padding:10px;text-align:center;border-bottom:1px solid #f0f0f0">${item.qty}</td>
            <td style="padding:10px;text-align:right;border-bottom:1px solid #f0f0f0">${fmtMoney(item.precio)}</td>
            <td style="padding:10px;text-align:right;border-bottom:1px solid #f0f0f0"><b>${fmtMoney(item.precio * item.qty)}</b></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="font-size:13.5px;max-width:300px;margin-left:auto">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Subtotal</span><span>${fmtMoney(v.subtotal)}</span></div>
      ${v.descuento > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#e74c3c"><span>Descuento (${v.descuento}%)</span><span>-${fmtMoney(v.subtotal * v.descuento / 100)}</span></div>` : ''}
      ${v.iva > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>IVA (12%)</span><span>${fmtMoney(v.iva)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:800;padding-top:10px;border-top:2px solid #e9ecef">
        <span>TOTAL</span><span style="color:#9a7a2e">${fmtMoney(v.total)}</span>
      </div>
    </div>
  `;
  openModal('modal-venta-detalle');
}

function exportSingleVentaExcel() {
  if (selectedVentaForExport) exportSingleVentaExcelById(selectedVentaForExport.id);
}

// ============================================================
// 20. CONFIGURACI\u00d3N
// ============================================================
function loadConfig() {
  document.getElementById('cfg-nombre').value = state.config.nombre || 'Barber\u00eda El Colocho';
  document.getElementById('cfg-direccion').value = state.config.direccion || '';
  document.getElementById('cfg-telefono').value = state.config.telefono || '';
  document.getElementById('cfg-email').value = state.config.email || '';
  document.getElementById('cfg-moneda').value = state.config.moneda || 'Q';
  document.getElementById('cfg-stock-min').value = state.config.stockMin || 5;
  document.getElementById('cfg-apertura').value = state.config.apertura || '08:00';
  document.getElementById('cfg-cierre').value = state.config.cierre || '20:00';
}

function saveConfig() {
  state.config.nombre = document.getElementById('cfg-nombre')?.value.trim() || 'Barber\u00eda El Colocho';
  state.config.direccion = document.getElementById('cfg-direccion')?.value.trim() || '';
  state.config.telefono = document.getElementById('cfg-telefono')?.value.trim() || '';
  state.config.email = document.getElementById('cfg-email')?.value.trim() || '';
  state.config.moneda = document.getElementById('cfg-moneda')?.value || 'Q';
  state.config.stockMin = parseInt(document.getElementById('cfg-stock-min')?.value) || 5;
  state.config.apertura = document.getElementById('cfg-apertura')?.value || '08:00';
  state.config.cierre = document.getElementById('cfg-cierre')?.value || '20:00';
  save('config');
  showToast('success', '\u00a1Configuraci\u00f3n guardada!', 'Los cambios se aplicaron correctamente');
}

function clearAllData() {
  if (!confirm('\u26a0\ufe0f \u00bfEst\u00e1s seguro? Se borrar\u00e1n TODOS los datos del sistema. Esta acci\u00f3n no se puede deshacer.')) return;
  if (!confirm('\u00bfConfirmas que quieres borrar todo?')) return;
  localStorage.clear();
  location.reload();
}

function importData() {
  showToast('info', 'Funci\u00f3n', 'Usa el archivo Excel para importar datos');
}

// ============================================================
// 21. EXCEL EXPORT
// ============================================================
function buildVentasSheet(ventas) {
  const rows = [
    ['#', 'Fecha', 'Hora', 'Cliente', 'Barbero', 'Productos/Servicios', 'Subtotal', 'Descuento%', 'IVA', 'Total', 'M\u00e9todo de Pago', 'Nota', 'Estado']
  ];
  ventas.forEach(v => {
    rows.push([
      v.numero || '',
      v.fecha || '',
      v.hora || '',
      v.cliente || 'Consumidor final',
      v.barbero || '',
      (v.items || []).map(i => `${i.nombre} x${i.qty}`).join(' | '),
      parseFloat(v.subtotal || 0).toFixed(2),
      v.descuento || 0,
      parseFloat(v.iva || 0).toFixed(2),
      parseFloat(v.total || 0).toFixed(2),
      v.metodoPago || '',
      v.nota || '',
      v.estado || 'completada'
    ]);
  });
  return rows;
}

function exportVentasExcel() {
  if (state.ventas.length === 0) { showToast('error', 'Sin datos', 'No hay ventas para exportar'); return; }
  const wb = XLSX.utils.book_new();

  // Hoja ventas
  const ventasData = buildVentasSheet(state.ventas);
  const wsVentas = XLSX.utils.aoa_to_sheet(ventasData);
  applySheetStyle(wsVentas, ventasData);
  XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');

  // Hoja items detalle
  const itemRows = [['Venta#','Fecha','Cliente','Tipo','Producto/Servicio','Precio Unit.','Cantidad','Total']];
  state.ventas.forEach(v => {
    (v.items || []).forEach(item => {
      itemRows.push([v.numero || '', v.fecha || '', v.cliente || '', item.tipo || '', item.nombre || '', item.precio, item.qty || 1, (item.precio * (item.qty || 1)).toFixed(2)]);
    });
  });
  const wsItems = XLSX.utils.aoa_to_sheet(itemRows);
  applySheetStyle(wsItems, itemRows);
  XLSX.utils.book_append_sheet(wb, wsItems, 'Detalle Items');

  XLSX.writeFile(wb, `ventas_colocho_${today()}.xlsx`);
  showToast('success', '\u2705 Excel exportado', 'Archivo de ventas guardado');
}

function exportSingleVentaExcelById(id) {
  const v = state.ventas.find(x => x.id === id);
  if (!v) return;

  const wb = XLSX.utils.book_new();
  const rows = [
    ['BARBER\u00cdA EL COLOCHO - Venta #' + v.numero],
    [],
    ['Fecha', v.fecha], ['Hora', v.hora], ['Cliente', v.cliente], ['Barbero', v.barbero],
    ['M\u00e9todo de Pago', v.metodoPago], ['Nota', v.nota || ''],
    [],
    ['Tipo', 'Producto/Servicio', 'Precio Unitario', 'Cantidad', 'Total'],
    ...(v.items || []).map(i => [i.tipo, i.nombre, i.precio, i.qty, (i.precio * i.qty).toFixed(2)]),
    [],
    ['', '', '', 'Subtotal', v.subtotal.toFixed(2)],
    ['', '', '', `Descuento (${v.descuento}%)`, (v.subtotal * v.descuento / 100).toFixed(2)],
    ['', '', '', 'IVA', v.iva.toFixed(2)],
    ['', '', '', 'TOTAL', v.total.toFixed(2)],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Recibo');
  XLSX.writeFile(wb, `venta_${v.numero}_${v.fecha}.xlsx`);
  showToast('success', 'Excel exportado', `Venta #${v.numero} guardada`);
}

function exportClientesExcel() {
  if (state.clientes.length === 0) { showToast('error', 'Sin datos', 'No hay clientes'); return; }
  const rows = [['Nombre','Tel\u00e9fono','Correo','Nacimiento','Notas','Fecha Registro','Visitas','Total Gastado']];
  const visits = {}, spending = {};
  state.ventas.forEach(v => {
    if (v.cliente) {
      visits[v.cliente] = (visits[v.cliente] || 0) + 1;
      spending[v.cliente] = (spending[v.cliente] || 0) + parseFloat(v.total || 0);
    }
  });
  state.clientes.forEach(c => {
    rows.push([c.nombre, c.telefono || '', c.email || '', c.nacimiento || '', c.notas || '', c.fechaRegistro || '', visits[c.nombre] || 0, (spending[c.nombre] || 0).toFixed(2)]);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  applySheetStyle(ws, rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  XLSX.writeFile(wb, `clientes_colocho_${today()}.xlsx`);
  showToast('success', 'Excel exportado', 'Lista de clientes guardada');
}

function exportInventarioExcel() {
  if (state.productos.length === 0) { showToast('error', 'Sin datos', 'No hay productos'); return; }
  const rows = [['Nombre','Categor\u00eda','Marca','Precio Venta','Precio Costo','Stock','Stock M\u00ednimo','Estado','Valor Inventario']];
  state.productos.forEach(p => {
    const s = parseInt(p.stock), m = parseInt(p.stockMin) || 5;
    const status = s === 0 ? 'Agotado' : s <= m ? 'Bajo' : 'Normal';
    rows.push([p.nombre, p.categoria, p.marca || '', p.precio, p.costo || 0, p.stock, p.stockMin || 5, status, (p.precio * p.stock).toFixed(2)]);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  applySheetStyle(ws, rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
  XLSX.writeFile(wb, `inventario_colocho_${today()}.xlsx`);
  showToast('success', 'Excel exportado', 'Inventario guardado');
}

function exportReporteExcel() {
  const wb = XLSX.utils.book_new();
  const periodo = document.getElementById('reporte-periodo')?.value || 'mes';

  // Ventas
  const wsVentas = XLSX.utils.aoa_to_sheet(buildVentasSheet(state.ventas));
  XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');

  // Resumen mensual
  const { labels, data } = getMonthlyData();
  const summaryRows = [['Mes','Ingresos'], ...labels.map((l, i) => [l, data[i]])];
  const wsResumen = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Mensual');

  XLSX.writeFile(wb, `reporte_colocho_${periodo}_${today()}.xlsx`);
  showToast('success', 'Reporte exportado', 'Archivo guardado');
}

function exportAllExcel() {
  const wb = XLSX.utils.book_new();

  // Ventas
  const wsV = XLSX.utils.aoa_to_sheet(buildVentasSheet(state.ventas));
  applySheetStyle(wsV, buildVentasSheet(state.ventas));
  XLSX.utils.book_append_sheet(wb, wsV, 'Ventas');

  // Productos
  const prodRows = [['Nombre','Categor\u00eda','Marca','Precio','Costo','Stock','StockMin']];
  state.productos.forEach(p => prodRows.push([p.nombre, p.categoria, p.marca||'', p.precio, p.costo||0, p.stock, p.stockMin||5]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prodRows), 'Productos');

  // Servicios
  const servRows = [['Nombre','Precio','Duraci\u00f3n (min)','Descripci\u00f3n']];
  state.servicios.forEach(s => servRows.push([s.nombre, s.precio, s.duracion||0, s.descripcion||'']));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(servRows), 'Servicios');

  // Clientes
  const cliRows = [['Nombre','Tel\u00e9fono','Email','Nacimiento','Notas','Fecha Registro']];
  state.clientes.forEach(c => cliRows.push([c.nombre, c.telefono||'', c.email||'', c.nacimiento||'', c.notas||'', c.fechaRegistro||'']));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cliRows), 'Clientes');

  // Barberos
  const barbRows = [['Nombre','Especialidad','Tel\u00e9fono','Comisi\u00f3n%']];
  state.barberos.forEach(b => barbRows.push([b.nombre, b.especialidad||'', b.telefono||'', b.comision||0]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(barbRows), 'Barberos');

  // Resumen mensual
  const { labels, data } = getMonthlyData();
  const sumRows = [['Mes','Ingresos (Q)'], ...labels.map((l, i) => [l, data[i]])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sumRows), 'Resumen Mensual');

  XLSX.writeFile(wb, `barberia_el_colocho_completo_${today()}.xlsx`);
  showToast('success', '\ud83d\udcca Excel completo exportado', 'Todas las hojas guardadas');
}

function appendVentaToExcel(venta) {
  // Guardar referencia en localStorage para pr\u00f3xima exportaci\u00f3n
  // (la exportaci\u00f3n real se hace al llamar exportVentasExcel)
  // Esta funci\u00f3n sirve como hook para cuando el usuario quiera exportar
  console.log('Venta registrada para exportaci\u00f3n:', venta.numero);
}

function applySheetStyle(ws, data) {
  if (!data || data.length === 0) return;
  const cols = data[0].length;
  ws['!cols'] = Array(cols).fill({ wch: 18 });
}

// ============================================================
// 22. MODAL + UI UTILS
// ============================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  // Reset form si es nuevo (no edici\u00f3n)
  if (id === 'modal-add-product') {
    const editId = document.getElementById('edit-product-id');
    if (editId && !editId.value) {
      ['p-nombre','p-precio','p-costo','p-stock','p-stock-min','p-emoji','p-marca','p-descripcion'].forEach(fId => {
        const el = document.getElementById(fId);
        if (el) el.value = '';
      });
    }
  }
  if (id === 'modal-add-service') {
    const editId = document.getElementById('edit-service-id');
    if (editId && !editId.value) {
      ['s-nombre','s-precio','s-duracion','s-emoji','s-descripcion'].forEach(fId => {
        const el = document.getElementById(fId);
        if (el) el.value = '';
      });
    }
  }
  if (id === 'modal-add-cita') {
    updateBarberSelect('cita-barbero');
    updateServicioSelect();
    const today2 = today();
    const fechaEl = document.getElementById('cita-fecha');
    if (fechaEl && !fechaEl.value) fechaEl.value = today2;
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  // Limpiar edit IDs
  ['edit-product-id','edit-service-id','edit-client-id','edit-barbero-id','edit-cita-id'].forEach(eid => {
    const el = document.getElementById(eid);
    if (el) el.value = '';
  });
}

// Cerrar modal al click fuera
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

function updateBadges() {
  const badge = document.getElementById('badge-cart');
  if (badge) badge.textContent = cart.reduce((a, c) => a + c.qty, 0);
  updateBadgeCitas();
}

// ============================================================
// 23. TOAST NOTIFICATIONS
// ============================================================
function showToast(type, title, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '\u2705', error: '\u274c', info: '\u2139\ufe0f', warning: '\u26a0\ufe0f' };
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || '\u2139\ufe0f'}</div>
    <div class="toast-text">
      <strong>${title}</strong>
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ============================================================
// 24. INICIALIZACI\u00d3N
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initDefaultData();
  updateTopbarDate();
  updateWelcomeMsg();
  setInterval(updateTopbarDate, 60000);
  renderDashboard();
  updateClientDatalist();
  updateBadges();

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => {
        m.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });
});
