 // 🦷 OdontoApp v2.0 — DentiStudio
// Módulo: Gestión Global
const CLINIC_NAME = "DentiStudio";
let pacientes = JSON.parse(localStorage.getItem('odontoapp_pacientes')) || [];
let savedResults = JSON.parse(localStorage.getItem('odontoapp_resultados')) || [];

// 🔘 Cambio de Tabs
document.addEventListener('DOMContentLoaded', () => {
  // Tabs principales
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Tabs dentición
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.tabType;
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.dentition-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(type + '-tab').classList.add('active');
    });
  });

  // Inicialización
  actualizarListaPacientes();
  actualizarEstadisticas();
  renderizarServicios();
});

// 👥 Módulo: Gestor de Pacientes
document.getElementById('formPaciente').addEventListener('submit', function(e) {
  e.preventDefault();
  const codigo = document.getElementById('codigo').value.trim();
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const telefono = document.getElementById('telefono').value.trim();

  if (!codigo || !nombre || !apellido) {
    alert('⚠️ Los campos Código, Nombre y Apellido son obligatorios.');
    return;
  }

  if (telefono && !/^(\+51\s?)?9\d{8}$/.test(telefono.replace(/-/g, ''))) {
    alert('📱 Formato de teléfono inválido. Use: +51 9 XXXX XXXX');
    return;
  }

  const nuevo = {
    id: Date.now(),
    codigo,
    nombre,
    apellido,
    email: document.getElementById('email').value,
    telefono,
    edad: parseInt(document.getElementById('edad').value) || null,
    diagnostico: document.getElementById('diagnostico').value,
    tratamiento: document.getElementById('tratamiento').value,
    estado: document.getElementById('estado').value,
    fechaRegistro: new Date().toISOString()
  };

  pacientes.push(nuevo);
  guardarPacientes();
  actualizarListaPacientes();
  actualizarEstadisticas();
  this.reset();
  alert(`✅ Paciente registrado en ${CLINIC_NAME}`);
});

function actualizarListaPacientes() {
  const lista = document.getElementById('listaPacientes');
  if (pacientes.length === 0) {
    lista.innerHTML = '<p class="empty-message">No hay pacientes registrados</p>';
    return;
  }

  lista.innerHTML = pacientes.map(p => `
    <div class="patient-item">
      <div>
        <strong>${p.codigo}</strong> — ${p.nombre} ${p.apellido}
        <br><small>${p.edad ? p.edad + ' años · ' : ''}${p.estado}</small>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="editarPaciente(${p.id})">✏️</button>
        <button class="btn btn-secondary" onclick="eliminarPaciente(${p.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function actualizarEstadisticas() {
  document.getElementById('totalPacientes').textContent = pacientes.length;
  const activos = pacientes.filter(p => p.estado === 'Activo').length;
  document.getElementById('pacientesActivos').textContent = activos;

  const edades = pacientes.map(p => p.edad).filter(e => e);
  const promedio = edades.length ? (edades.reduce((a,b) => a+b, 0) / edades.length).toFixed(1) : '—';
  document.getElementById('promedioEdad').textContent = edades.length ? promedio + ' años' : '—';
}

document.getElementById('searchInput').addEventListener('input', function() {
  const query = this.value.toLowerCase();
  const tipo = document.getElementById('tipoSearch').value;
  let resultados = pacientes;

  if (query) {
    resultados = pacientes.filter(p => {
      switch (tipo) {
        case 'codigo': return p.codigo.toLowerCase().includes(query);
        case 'nombre': return p.nombre.toLowerCase().includes(query);
        case 'apellido': return p.apellido.toLowerCase().includes(query);
        default: return (
          p.codigo.toLowerCase().includes(query) ||
          p.nombre.toLowerCase().includes(query) ||
          p.apellido.toLowerCase().includes(query)
        );
      }
    });
  }

  document.getElementById('resultadosBusqueda').innerHTML = 
    resultados.length === 0 ? '<p>No se encontraron resultados</p>' :
    resultados.map(p => `<div class="result-item">${p.codigo} — ${p.nombre} ${p.apellido} (${p.estado})</div>`).join('');
});

function exportarJSON() {
  const data = JSON.stringify(pacientes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${CLINIC_NAME}_pacientes_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importarJSON() {
  document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error();
      pacientes = data;
      guardarPacientes();
      actualizarListaPacientes();
      actualizarEstadisticas();
      alert(`✅ ${data.length} pacientes importados`);
    } catch {
      alert('❌ Archivo JSON no válido.');
    }
  };
  reader.readAsText(file);
});

function guardarPacientes() {
  localStorage.setItem('odontoapp_pacientes', JSON.stringify(pacientes));
}

function editarPaciente(id) {
  const p = pacientes.find(p => p.id === id);
  if (!p) return;
  const campos = ['codigo','nombre','apellido','email','telefono','edad','diagnostico','tratamiento','estado'];
  campos.forEach(c => document.getElementById(c).value = p[c] || '');
  eliminarPaciente(id);
}

function eliminarPaciente(id) {
  if (confirm('¿Eliminar paciente? No se puede deshacer.')) {
    pacientes = pacientes.filter(p => p.id !== id);
    guardarPacientes();
    actualizarListaPacientes();
    actualizarEstadisticas();
  }
}

function enviarWhatsApp() {
  const p = pacientes.find(p => p.estado === 'Activo');
  if (!p) return alert('No hay pacientes activos para notificar.');
  const msg = `Hola ${p.nombre}, le recordamos su cita en *${CLINIC_NAME}* 🦷\n📍 Ayacucho, Huamanga\n\n¿Confirmar? Responda SÍ o NO.`;
  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/51900000000?text=${encoded}`, '_blank');
}

// ⚙️ GitHub Config (mock)
function mostrarConfig() {
  document.getElementById('githubConfig').style.display = 'block';
  document.getElementById('alertConfig').style.display = 'none';
}
function ocultarConfig() {
  document.getElementById('githubConfig').style.display = 'none';
}
function guardarConfigGitHub() {
  const token = document.getElementById('githubToken').value;
  if (token) {
    localStorage.setItem('gh_token', token);
    alert('✅ Configuración guardada');
  }
  ocultarConfig();
}
const token = localStorage.getItem('gh_token');
if (!token) document.getElementById('alertConfig').style.display = 'block';

// 📏 Módulo: Moyers & Tanaka-Johnston
const moyersData75 = {
  "varon": { "Superior": {22:19.2,23:20.6,24:21.8,24.5:22.8,25:23.3,25.5:24.6,26:25.4},
            "Inferior": {22:18.7,23:19.8,24:20.9,24.5:22.5,25:23.0,25.5:24.2,26:25.0} },
  "mujer": { "Superior": {22:18.0,23:19.2,24:20.4,24.5:21.8,25:21.5,25.5:22.8,26:23.8},
            "Inferior": {22:18.0,23:19.2,24:20.4,24.5:22.1,25:22.3,25.5:23.5,26:24.4} }
};
const moyersData90 = {
  "varon": { "Superior": {22:20.1,23:21.8,24:23.2,24.5:24.5,25:25.2,25.5:26.8,26:27.9},
            "Inferior": {22:19.5,23:20.9,24:22.1,24.5:24.0,25:25.0,25.5:26.5,26:27.5} },
  "mujer": { "Superior": {22:18.8,23:20.3,24:21.9,24.5:23.5,25:23.8,25.5:25.4,26:26.7},
            "Inferior": {22:18.6,23:20.1,24:21.5,24.5:23.6,25:24.2,25.5:25.8,26:27.1} }
};

function interpolar(val, obj) {
  const keys = Object.keys(obj).map(Number).sort((a,b) => a-b);
  if (obj[val]) return obj[val];
  for (let i = 1; i < keys.length; i++) {
    if (val < keys[i]) {
      const x1 = keys[i-1], x2 = keys[i], y1 = obj[x1], y2 = obj[x2];
      return y1 + (y2 - y1) * (val - x1) / (x2 - x1);
    }
  }
  return obj[keys[keys.length-1]];
}

function calcularMoyers() {
  const suma = parseFloat(document.getElementById('inci_mm').value);
  const sexo = document.getElementById('sexo').value;
  const arcada = document.getElementById('arcada').value;
  const modelo = parseFloat(document.getElementById('espacio_modelo').value);
  const paciente = document.getElementById('moyers-patient').value || 'Paciente';

  if (!suma || isNaN(suma) || suma < 20 || suma > 30) {
    alert('⚠️ Suma de incisivos debe estar entre 20 y 30 mm.');
    return;
  }

  const m75 = interpolar(suma, moyersData75[sexo][arcada]);
  const m90 = interpolar(suma, moyersData90[sexo][arcada]);
  const tj = (suma / 2) + (arcada === "Inferior" ? 10.5 : 11.0);

  let html = '<div class="results">';
  html += `<div class="result-item moyers"><span>Moyers 75% (${arcada})</span><span>${m75.toFixed(1)} mm</span></div>`;
  html += `<div class="result-item"><span>Moyers 90% (${arcada})</span><span>${m90.toFixed(1)} mm</span></div>`;
  html += `<div class="result-item tanaka"><span>Tanaka & Johnston</span><span>${tj.toFixed(1)} mm</span></div>`;

  if (modelo && !isNaN(modelo)) {
    const d75 = modelo - m75;
    const dtj = modelo - tj;
    const clase75 = d75 >= 0 ? 'positive' : 'negative';
    const claseTJ = dtj >= 0 ? 'positive' : 'negative';
    html += `<div class="result-item ${clase75}"><span>Discrepancia 75%</span><span>${d75.toFixed(1)} mm</span></div>`;
    html += `<div class="result-item ${claseTJ}"><span>Discrepancia T&J</span><span>${dtj.toFixed(1)} mm</span></div>`;

    // Diagnóstico integrado
    const ambosNeg = d75 < 0 && dtj < 0;
    const diag = ambosNeg ? 
      `⚠️ <strong>Apiñamiento Probable</strong> — Ambos métodos coinciden. Evaluar expansión o extracciones.` :
      `✅ <strong>Espacio Adecuado</strong> — Predicción favorable para ${paciente}. Seguimiento estándar.`;
    document.getElementById('diagnosticoIntegrado').style.display = 'block';
    document.getElementById('diagnosticoIntegrado').innerHTML = diag;
  }

  html += '</div>';
  document.getElementById('resultadosMoyers').innerHTML = html;

  // Gráfico simple
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'var(--color-surface)';
  ctx.fillRect(0,0,400,200);
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'var(--color-text)';
  ctx.fillText('Método', 50, 20); ctx.fillText('Espacio Pred.', 150, 20); ctx.fillText('Discrep.', 250, 20);
  const metodos = [['Moyers 75%', m75, d75], ['T&J', tj, dtj]];
  metodos.forEach((m,i) => {
    ctx.fillStyle = m[2] >= 0 ? '#4caf50' : '#c0152f';
    ctx.fillText(m[0], 50, 60 + i*40);
    ctx.fillText(m[1].toFixed(1)+' mm', 150, 60 + i*40);
    ctx.fillText(m[2].toFixed(1)+' mm', 250, 60 + i*40);
  });
  document.getElementById('graficoMoyers').innerHTML = '';
  document.getElementById('graficoMoyers').appendChild(canvas);
}

// 🦷 Módulo: Discrepancia + Bolton
function autoCalculateAnteriorSums() {
  let sumSup = 0, sumInf = 0;
  for (let i = 3; i <= 8; i++) {
    const v1 = parseFloat(document.getElementById(`perm-sup-${i}`).value) || 0;
    const v2 = parseFloat(document.getElementById(`perm-inf-${i}`).value) || 0;
    sumSup += v1;
    sumInf += v2;
  }
  document.getElementById('bolton-ant-sup').value = sumSup > 0 ? sumSup.toFixed(2) : '';
  document.getElementById('bolton-ant-inf').value = sumInf > 0 ? sumInf.toFixed(2) : '';
}

function calculatePermanent() {
  autoCalculateAnteriorSums();
  // Superior
  let reqSup = 0;
  for (let i = 1; i <= 10; i++) reqSup += parseFloat(document.getElementById(`perm-sup-${i}`).value) || 0;
  const dispSup = parseFloat(document.getElementById('perm-espacio-sup').value);
  if (reqSup && dispSup) {
    const disc = dispSup - reqSup;
    document.getElementById('perm-required-sup').textContent = reqSup.toFixed(2) + ' mm';
    const el = document.getElementById('perm-discrepancy-sup');
    el.textContent = disc.toFixed(2) + ' mm';
    el.className = 'result-value';
    const bar = document.getElementById('perm-bar-sup');
    if (disc >= 2) { el.classList.add('positive'); bar.style.background = '#4caf50'; }
    else if (disc <= -2) { el.classList.add('negative'); bar.style.background = '#c0152f'; }
    else { el.classList.add('neutral'); bar.style.background = '#ff9800'; }
    bar.style.width = Math.max(0, Math.min(100, 50 + (disc / 4) * 50)) + '%';
  }
  // Inferior (similar)
  let reqInf = 0;
  for (let i = 1; i <= 10; i++) reqInf += parseFloat(document.getElementById(`perm-inf-${i}`).value) || 0;
  const dispInf = parseFloat(document.getElementById('perm-espacio-inf').value);
  if (reqInf && dispInf) {
    const disc = dispInf - reqInf;
    document.getElementById('perm-required-inf').textContent = reqInf.toFixed(2) + ' mm';
    const el = document.getElementById('perm-discrepancy-inf');
    el.textContent = disc.toFixed(2) + ' mm';
    el.className = 'result-value';
    const bar = document.getElementById('perm-bar-inf');
    if (disc >= 2) { el.classList.add('positive'); bar.style.background = '#4caf50'; }
    else if (disc <= -2) { el.classList.add('negative'); bar.style.background = '#c0152f'; }
    else { el.classList.add('neutral'); bar.style.background = '#ff9800'; }
    bar.style.width = Math.max(0, Math.min(100, 50 + (disc / 4) * 50)) + '%';
  }
  // Recomendación
  if (reqSup && dispSup && reqInf && dispInf) {
    const dSup = dispSup - reqSup;
    const dInf = dispInf - reqInf;
    let txt = '';
    if (dSup >= 2 && dInf >= 2) txt = '✅ Diastemas en ambas arcadas. Evaluar cierre estético.';
    else if (dSup <= -2 && dInf <= -2) txt = '⚠️ Apiñamiento bilateral. Planificar expansión o stripping.';
    else txt = '📋 Arcadas asimétricas. Individualizar tratamiento por cuadrante.';
    document.getElementById('perm-recommendation').textContent = txt;
  }
  // Bolton
  calculateBolton();
}

function calculateBolton() {
  const antSup = parseFloat(document.getElementById('bolton-ant-sup').value);
  const antInf = parseFloat(document.getElementById('bolton-ant-inf').value);
  if (!antSup || !antInf) return;

  const boltonAnt = (antInf / antSup) * 100;
  const inRange = boltonAnt >= 75.7 && boltonAnt <= 78.7;
  const antHTML = `
    <div class="bolton-result-item">
      <div class="bolton-label">Índice Anterior (6 dientes)</div>
      <div class="bolton-value">${boltonAnt.toFixed(2)}%</div>
      <div class="bolton-reference">Rango ideal: 77.2% ± 1.5%</div>
      <div class="bolton-analysis ${inRange ? 'normal' : 'problem'}">
        ${inRange ? '✅ Normal' : `⚠️ Fuera de rango (${boltonAnt < 75.7 ? 'exceso superior' : 'exceso inferior'})`}
      </div>
    </div>
  `;
  document.getElementById('bolton-results').innerHTML = antHTML;
}

function clearAllData() {
  if (confirm('¿Borrar todos los datos de esta ficha?')) {
    ['perm-patient','perm-espacio-sup','perm-espacio-inf'].forEach(id => document.getElementById(id).value = '');
    for (let i=1; i<=10; i++) {
      document.getElementById(`perm-sup-${i}`).value = '';
      document.getElementById(`perm-inf-${i}`).value = '';
    }
    document.getElementById('bolton-mol-sup-der').value = '';
    document.getElementById('bolton-mol-sup-izq').value = '';
    document.getElementById('bolton-mol-inf-der').value = '';
    document.getElementById('bolton-mol-inf-izq').value = '';
    document.getElementById('perm-required-sup').textContent = '— mm';
    document.getElementById('perm-discrepancy-sup').textContent = '— mm';
    document.getElementById('perm-bar-sup').style.width = '0%';
    document.getElementById('bolton-results').innerHTML = '';
  }
}

function loadPermanentExample() {
  const sup = [7.0,7.2,7.8,6.5,8.5,8.5,6.5,7.8,7.2,7.0];
  const inf = [6.8,7.0,6.5,5.8,5.2,5.2,5.8,6.5,7.0,6.8];
  sup.forEach((v,i) => document.getElementById(`perm-sup-${i+1}`).value = v);
  inf.forEach((v,i) => document.getElementById(`perm-inf-${i+1}`).value = v);
  document.getElementById('perm-espacio-sup').value = '74.0';
  document.getElementById('perm-espacio-inf').value = '64.0';
  document.getElementById('bolton-mol-sup-der').value = '10.5';
  document.getElementById('bolton-mol-sup-izq').value = '10.5';
  document.getElementById('bolton-mol-inf-der').value = '11.0';
  document.getElementById('bolton-mol-inf-izq').value = '11.0';
  calculatePermanent();
}

function saveResultsLocal() {
  const paciente = document.getElementById('perm-patient').value || 'Anónimo';
  const resultado = {
    tipo: 'Permanente',
    paciente,
    fecha: new Date().toISOString(),
    resultados: {
      supReq: document.getElementById('perm-required-sup').textContent,
      supDisc: document.getElementById('perm-discrepancy-sup').textContent,
      infReq: document.getElementById('perm-required-inf').textContent,
      infDisc: document.getElementById('perm-discrepancy-inf').textContent
    }
  };
  savedResults.push(resultado);
  localStorage.setItem('odontoapp_resultados', JSON.stringify(savedResults));
  alert(`✅ Resultados de ${paciente} guardados localmente`);
}

function generatePDFReport() {
  alert('📄 Función de generación de PDF lista para integrar con jsPDF. ¿Desea que la agregue?');
}

// 🦴 Dentición Mixta
function calculateMixed() {
  const supAnt = parseFloat(document.getElementById('mix-sup-anteriores').value) || 0;
  const supEsp = parseFloat(document.getElementById('mix-espacio-sup').value) || 0;
  const infAnt = parseFloat(document.getElementById('mix-inf-anteriores').value) || 0;
  const infEsp = parseFloat(document.getElementById('mix-espacio-inf').value) || 0;

  if (supAnt && supEsp) {
    const disc = supEsp - supAnt;
    document.getElementById('mix-disc-sup').textContent = disc.toFixed(2) + ' mm';
  }
  if (infAnt && infEsp) {
    const disc = infEsp - infAnt;
    document.getElementById('mix-disc-inf').textContent = disc.toFixed(2) + ' mm';
  }
  if (supAnt && supEsp && infAnt && infEsp) {
    const dSup = supEsp - supAnt;
    const dInf = infEsp - infAnt;
    let txt = '';
    if (dSup >= 0 && dInf >= 0) txt = '✅ Espacio adecuado para erupción caninos y premolares.';
    else if (dSup < 0 || dInf < 0) txt = '⚠️ Apiñamiento anticipado. Considerar mantenedor de espacio o expansión temprana.';
    document.getElementById('mix-recommendation').textContent = txt;
  }
}

function loadMixedExample() {
  document.getElementById('mix-sup-anteriores').value = '35.0';
  document.getElementById('mix-espacio-sup').value = '37.0';
  document.getElementById('mix-inf-anteriores').value = '32.5';
  document.getElementById('mix-espacio-inf').value = '33.0';
  calculateMixed();
}

// 💰 Módulo: Catálogo
const servicios = JSON.parse(localStorage.getItem('dentistudio_servicios')) || [
  {nombre:"Ortodoncia con Brackets",precio:2500,desc:"Tratamiento para alinear los dientes.",img:"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e0f2f1'/><text x='50' y='55' text-anchor='middle' font-size='12' fill='%23004d40'>Brackets</text></svg>"},
  {nombre:"Profilaxis Dental",precio:120,desc:"Limpieza profesional para eliminar sarro.",img:"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e8f5e9'/><text x='50' y='55' text-anchor='middle' font-size='12' fill='%232e7d32'>Limpieza</text></svg>"},
  {nombre:"Blanqueamiento",precio:600,desc:"Aclara el color de los dientes.",img:"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23fff8e1'/><text x='50' y='55' text-anchor='middle' font-size='12' fill='%23f57f17'>Blanco</text></svg>"},
  {nombre:"Implante Dental",precio:3200,desc:"Reemplazo permanente de diente perdido.",img:"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f3e5f5'/><text x='50' y='55' text-anchor='middle' font-size='12' fill='%237b1fa2'>Implante</text></svg>"}
];

function renderizarServicios() {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = servicios.map(s => `
    <div class="service-card" onclick="abrirModal('${s.nombre}',${s.precio},'${s.desc}','${s.img}')">
      <img src="${s.img}" alt="${s.nombre}">
      <div class="card-content">
        <h3 class="service-title">${s.nombre}</h3>
        <span class="service-price">S/ ${s.precio.toLocaleString('es-PE')}</span>
        <p>${s.desc}</p>
      </div>
    </div>
  `).join('');
}

function abrirModal(nombre, precio, desc, img) {
  document.getElementById('modalImage').src = img;
  document.getElementById('modalTitle').textContent = nombre;
  document.getElementById('modalPrice').innerHTML = `<strong>Precio:</strong> S/ ${precio.toLocaleString('es-PE')}`;
  document.getElementById('modalDescription').textContent = desc;
  document.getElementById('modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('modal').classList.remove('active');
  document.body.style.overflow = '';
});

function agendarDesdeModal() {
  document.getElementById('modal').classList.remove('active');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('gestor').classList.add('active');
  document.querySelector('.tab-btn[data-tab="gestor"]').classList.add('active');
  alert('✅ Formulario de cita listo. Complete los datos del paciente.');
}

// ✏️ Edición de Precios
function mostrarEdicionPrecios() {
  document.getElementById('catalogo').style.display = 'none';
  document.getElementById('priceManagement').style.display = 'block';
  const list = document.getElementById('priceList');
  list.innerHTML = servicios.map((s,i) => `
    <div class="price-item">
      <div><strong>${s.nombre}</strong><br><small>${s.desc}</small></div>
      <div>
        <label>Precio: S/ </label>
        <input type="number" id="precio-${i}" value="${s.precio}" min="0" step="0.01">
      </div>
    </div>
  `).join('');
}

function guardarCambiosPrecios() {
  let ok = true;
  servicios.forEach((s,i) => {
    const val = parseFloat(document.getElementById(`precio-${i}`).value);
    if (isNaN(val) || val <= 0) ok = false;
    else s.precio = val;
  });
  if (!ok) return alert('❌ Precios deben ser > 0');
  localStorage.setItem('dentistudio_servicios', JSON.stringify(servicios));
  renderizarServicios();
  cancelarEdicionPrecios();
}

function cancelarEdicionPrecios() {
  document.getElementById('priceManagement').style.display = 'none';
  document.getElementById('catalogo').style.display = 'block';
}

// 📅 Acción rápida
function nuevaCita() {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="gestor"]').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('gestor').classList.add('active');
  document.getElementById('nombre').focus();
}
