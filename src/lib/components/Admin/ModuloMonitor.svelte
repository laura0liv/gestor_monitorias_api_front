<script>
  import { onMount } from 'svelte';

  // --- STATE ---
  let activeTab = 'disponibilidad';

  // Disponibilidad
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  let disponibilidad = {};
  $: {
    if (Object.keys(disponibilidad).length === 0) {
      dias.forEach(d => { disponibilidad[d] = {}; horas.forEach(h => { disponibilidad[d][h] = false; }); });
    }
  }
  function toggleSlot(dia, hora) { disponibilidad[dia][hora] = !disponibilidad[dia][hora]; disponibilidad = {...disponibilidad}; }
  let guardadoMsg = '';
  function guardarDisponibilidad() { guardadoMsg = '✓ Disponibilidad guardada exitosamente'; setTimeout(() => guardadoMsg = '', 2500); }

  // Materias
  let materias = [
    { id: 1, nombre: 'Cálculo Diferencial', codigo: 'MAT201', estudiantes: 12, color: '#6C63FF' },
    { id: 2, nombre: 'Álgebra Lineal', codigo: 'MAT305', estudiantes: 8, color: '#FF6584' },
    { id: 3, nombre: 'Física Mecánica', codigo: 'FIS101', estudiantes: 15, color: '#43D9AD' },
    { id: 4, nombre: 'Estadística', codigo: 'MAT410', estudiantes: 6, color: '#FFB347' },
  ];

  // Sesiones
  let sesiones = [
    { id: 1, materia: 'Cálculo Diferencial', estudiante: 'Ana Martínez', fecha: '2026-03-14', hora: '10:00', duracion: 60, estado: 'pendiente', sala: 'Virtual', notas: '' },
    { id: 2, materia: 'Álgebra Lineal', estudiante: 'Carlos Ruiz', fecha: '2026-03-14', hora: '14:00', duracion: 90, estado: 'pendiente', sala: 'Sala B-204', notas: '' },
    { id: 3, materia: 'Física Mecánica', estudiante: 'Laura Gómez', fecha: '2026-03-13', hora: '09:00', duracion: 60, estado: 'completada', sala: 'Virtual', resultado: 'exitosa', notas: 'Revisamos cinemática y ejercicios de vectores.' },
    { id: 4, materia: 'Estadística', estudiante: 'Miguel Torres', fecha: '2026-03-12', hora: '16:00', duracion: 60, estado: 'completada', sala: 'Sala A-101', resultado: 'exitosa', notas: 'Trabajamos distribuciones de probabilidad.' },
    { id: 5, materia: 'Cálculo Diferencial', estudiante: 'Sofía Perez', fecha: '2026-03-11', hora: '11:00', duracion: 90, estado: 'completada', sala: 'Virtual', resultado: 'parcial', notas: 'El estudiante necesita refuerzo en límites.' },
    { id: 6, materia: 'Álgebra Lineal', estudiante: 'David Mora', fecha: '2026-03-10', hora: '15:00', duracion: 60, estado: 'cancelada', sala: 'Sala B-204', notas: 'Estudiante no se presentó.' },
  ];

  let sesionDetalle = null;
  let sesionResultado = null;
  let resultadoForm = { resultado: 'exitosa', notas: '', temas: '' };

  function verDetalle(s) { sesionDetalle = s; }
  function cerrarDetalle() { sesionDetalle = null; }
  function abrirResultado(s) { sesionResultado = s; resultadoForm = { resultado: s.resultado || 'exitosa', notas: s.notas || '', temas: '' }; }
  function guardarResultado() {
    sesiones = sesiones.map(s => s.id === sesionResultado.id ? { ...s, estado: 'completada', resultado: resultadoForm.resultado, notas: resultadoForm.notas } : s);
    sesionResultado = null;
  }

  // Tabs config
  const tabs = [
    { id: 'disponibilidad', label: 'Disponibilidad', icon: '◷' },
    { id: 'materias', label: 'Mis Materias', icon: '⊞' },
    { id: 'sesiones', label: 'Sesiones', icon: '⊡' },
    { id: 'historial', label: 'Historial', icon: '⊟' },
  ];

  $: sesionesHoy = sesiones.filter(s => s.fecha === '2026-03-14' && s.estado === 'pendiente');
  $: historial = sesiones.filter(s => s.estado !== 'pendiente');
  $: stats = {
    total: sesiones.filter(s => s.estado === 'completada').length,
    exitosas: sesiones.filter(s => s.resultado === 'exitosa').length,
    canceladas: sesiones.filter(s => s.estado === 'cancelada').length,
    materias: materias.length,
  };

  onMount(() => {
    dias.forEach(d => { disponibilidad[d] = {}; horas.forEach(h => { disponibilidad[d][h] = false; }); });
    disponibilidad['Lunes']['10:00'] = true; disponibilidad['Lunes']['11:00'] = true; disponibilidad['Miércoles']['14:00'] = true; disponibilidad['Viernes']['09:00'] = true;
    disponibilidad = {...disponibilidad};
  });
</script>

<div class="monitor-shell">
  <!-- Header -->
  <header class="monitor-header">
    <div class="header-left">
      <div class="avatar">JR</div>
      <div>
        <div class="header-name">Jorge Ramírez</div>
        <div class="header-role">Monitor Académico · Ingeniería</div>
      </div>
    </div>
    <div class="header-stats">
      <div class="hstat"><span class="hstat-val">{stats.total}</span><span class="hstat-lbl">Sesiones</span></div>
      <div class="hstat"><span class="hstat-val">{stats.exitosas}</span><span class="hstat-lbl">Exitosas</span></div>
      <div class="hstat"><span class="hstat-val">{stats.materias}</span><span class="hstat-lbl">Materias</span></div>
    </div>
  </header>

  <!-- Tabs -->
  <nav class="tab-nav">
    {#each tabs as tab}
      <button class="tab-btn {activeTab === tab.id ? 'active' : ''}" on:click={() => activeTab = tab.id}>
        <span class="tab-icon">{tab.icon}</span>
        <span>{tab.label}</span>
      </button>
    {/each}
  </nav>

  <main class="monitor-main">

    <!-- DISPONIBILIDAD -->
    {#if activeTab === 'disponibilidad'}
    <div class="panel">
      <div class="panel-title">Configura tu disponibilidad semanal</div>
      <p class="panel-sub">Selecciona los bloques horarios en que puedes atender sesiones de monitoría.</p>
      <div class="grid-wrap">
        <div class="time-grid">
          <div class="grid-corner"></div>
          {#each dias as dia}
            <div class="grid-dia">{dia.slice(0,3)}</div>
          {/each}
          {#each horas as hora}
            <div class="grid-hora">{hora}</div>
            {#each dias as dia}
              <button
                class="slot {disponibilidad[dia]?.[hora] ? 'on' : 'off'}"
                on:click={() => toggleSlot(dia, hora)}
                title="{dia} {hora}"
              ></button>
            {/each}
          {/each}
        </div>
      </div>
      <div class="legend">
        <span class="dot on"></span>Disponible &nbsp;
        <span class="dot off"></span>No disponible
      </div>
      <button class="btn-primary" on:click={guardarDisponibilidad}>Guardar disponibilidad</button>
      {#if guardadoMsg}<div class="success-msg">{guardadoMsg}</div>{/if}
    </div>
    {/if}

    <!-- MATERIAS -->
    {#if activeTab === 'materias'}
    <div class="panel">
      <div class="panel-title">Materias asignadas</div>
      <p class="panel-sub">Estas son las asignaturas en las que estás habilitado para hacer monitorías.</p>
      <div class="materias-grid">
        {#each materias as m}
          <div class="materia-card" style="--mc: {m.color}">
            <div class="mc-bar"></div>
            <div class="mc-body">
              <div class="mc-codigo">{m.codigo}</div>
              <div class="mc-nombre">{m.nombre}</div>
              <div class="mc-footer">
                <span class="mc-est">👥 {m.estudiantes} estudiantes</span>
                <span class="mc-badge">Activa</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    {/if}

    <!-- SESIONES -->
    {#if activeTab === 'sesiones'}
    <div class="panel">
      <div class="panel-title">Sesiones agendadas</div>
      <p class="panel-sub">Próximas monitorías programadas. Puedes ver detalles o registrar el resultado al finalizar.</p>
      {#if sesionesHoy.length > 0}
        <div class="hoy-badge">📅 Hoy tienes {sesionesHoy.length} sesión{sesionesHoy.length > 1 ? 'es' : ''}</div>
      {/if}
      <div class="sesiones-list">
        {#each sesiones.filter(s => s.estado === 'pendiente') as s}
          <div class="sesion-row">
            <div class="sesion-left">
              <div class="sesion-dot"></div>
              <div>
                <div class="sesion-mat">{s.materia}</div>
                <div class="sesion-meta">{s.estudiante} · {s.hora} · {s.duracion}min · {s.sala}</div>
                <div class="sesion-fecha">{s.fecha}</div>
              </div>
            </div>
            <div class="sesion-actions">
              <button class="btn-outline" on:click={() => verDetalle(s)}>Ver detalle</button>
              <button class="btn-primary small" on:click={() => abrirResultado(s)}>Registrar resultado</button>
            </div>
          </div>
        {/each}
        {#if sesiones.filter(s => s.estado === 'pendiente').length === 0}
          <div class="empty">No tienes sesiones pendientes.</div>
        {/if}
      </div>
    </div>
    {/if}

    <!-- HISTORIAL -->
    {#if activeTab === 'historial'}
    <div class="panel">
      <div class="panel-title">Historial de monitorías</div>
      <p class="panel-sub">Registro de todas las sesiones completadas o canceladas.</p>
      <div class="hist-stats">
        <div class="hst"><span class="hst-val exitosa">{stats.exitosas}</span><span class="hst-l">Exitosas</span></div>
        <div class="hst"><span class="hst-val parcial">{sesiones.filter(s=>s.resultado==='parcial').length}</span><span class="hst-l">Parciales</span></div>
        <div class="hst"><span class="hst-val cancelada">{stats.canceladas}</span><span class="hst-l">Canceladas</span></div>
      </div>
      <div class="sesiones-list">
        {#each historial as s}
          <div class="sesion-row hist">
            <div class="sesion-left">
              <div class="sesion-dot {s.estado === 'cancelada' ? 'cancel' : s.resultado === 'parcial' ? 'parcial' : 'done'}"></div>
              <div>
                <div class="sesion-mat">{s.materia}</div>
                <div class="sesion-meta">{s.estudiante} · {s.hora} · {s.sala}</div>
                <div class="sesion-fecha">{s.fecha}</div>
                {#if s.notas}<div class="sesion-notas">"{s.notas}"</div>{/if}
              </div>
            </div>
            <div class="sesion-right">
              {#if s.resultado}
                <span class="badge-res {s.resultado}">{s.resultado}</span>
              {:else if s.estado === 'cancelada'}
                <span class="badge-res cancelada">cancelada</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
    {/if}
  </main>
</div>

<!-- Modal Detalle -->
{#if sesionDetalle}
<div class="overlay" on:click={cerrarDetalle}>
  <div class="modal" on:click|stopPropagation>
    <div class="modal-title">Detalle de sesión</div>
    <div class="modal-row"><span class="ml">Materia</span><span>{sesionDetalle.materia}</span></div>
    <div class="modal-row"><span class="ml">Estudiante</span><span>{sesionDetalle.estudiante}</span></div>
    <div class="modal-row"><span class="ml">Fecha</span><span>{sesionDetalle.fecha}</span></div>
    <div class="modal-row"><span class="ml">Hora</span><span>{sesionDetalle.hora}</span></div>
    <div class="modal-row"><span class="ml">Duración</span><span>{sesionDetalle.duracion} minutos</span></div>
    <div class="modal-row"><span class="ml">Sala</span><span>{sesionDetalle.sala}</span></div>
    <button class="btn-primary" style="width:100%;margin-top:1rem" on:click={cerrarDetalle}>Cerrar</button>
  </div>
</div>
{/if}

<!-- Modal Resultado -->
{#if sesionResultado}
<div class="overlay" on:click={() => sesionResultado = null}>
  <div class="modal" on:click|stopPropagation>
    <div class="modal-title">Registrar resultado</div>
    <div class="modal-row"><span class="ml">Sesión con</span><span>{sesionResultado.estudiante}</span></div>
    <div class="modal-row"><span class="ml">Materia</span><span>{sesionResultado.materia}</span></div>
    <div class="field">
      <label>Resultado de la sesión</label>
      <select bind:value={resultadoForm.resultado}>
        <option value="exitosa">✓ Exitosa — objetivos cumplidos</option>
        <option value="parcial">◑ Parcial — necesita refuerzo</option>
        <option value="cancelada">✕ No realizada</option>
      </select>
    </div>
    <div class="field">
      <label>Temas tratados</label>
      <input type="text" bind:value={resultadoForm.temas} placeholder="Ej: Derivadas, regla de la cadena..." />
    </div>
    <div class="field">
      <label>Notas / observaciones</label>
      <textarea bind:value={resultadoForm.notas} placeholder="Escribe un resumen de la sesión o recomendaciones..."></textarea>
    </div>
    <div class="modal-btns">
      <button class="btn-outline" on:click={() => sesionResultado = null}>Cancelar</button>
      <button class="btn-primary" on:click={guardarResultado}>Guardar resultado</button>
    </div>
  </div>
</div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }

  .monitor-shell {
    font-family: 'Sora', sans-serif;
    background: #0d0f1a;
    min-height: 100vh;
    color: #e8eaf6;
    display: flex;
    flex-direction: column;
  }

  /* HEADER */
  .monitor-header {
    background: linear-gradient(135deg, #141728 0%, #1a1f3c 100%);
    border-bottom: 1px solid #2a2f52;
    padding: 1.25rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .header-left { display: flex; align-items: center; gap: 1rem; }
  .avatar {
    width: 46px; height: 46px; border-radius: 14px;
    background: linear-gradient(135deg, #6C63FF, #A78BFA);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 1rem; color: #fff; flex-shrink: 0;
  }
  .header-name { font-size: 1.05rem; font-weight: 600; color: #fff; }
  .header-role { font-size: 0.78rem; color: #7c83b0; margin-top: 1px; }
  .header-stats { display: flex; gap: 1.5rem; }
  .hstat { display: flex; flex-direction: column; align-items: center; }
  .hstat-val { font-size: 1.3rem; font-weight: 700; color: #A78BFA; font-family: 'JetBrains Mono', monospace; }
  .hstat-lbl { font-size: 0.7rem; color: #7c83b0; text-transform: uppercase; letter-spacing: .05em; }

  /* TABS */
  .tab-nav {
    display: flex; gap: 0;
    background: #10121f;
    border-bottom: 1px solid #1f2340;
    padding: 0 1.5rem;
    overflow-x: auto;
  }
  .tab-btn {
    display: flex; align-items: center; gap: 0.45rem;
    padding: 0.9rem 1.25rem;
    background: none; border: none; border-bottom: 2px solid transparent;
    color: #6b7290; cursor: pointer; font-family: 'Sora', sans-serif;
    font-size: 0.85rem; font-weight: 500; white-space: nowrap;
    transition: color .2s, border-color .2s;
  }
  .tab-btn:hover { color: #c4c9ee; }
  .tab-btn.active { color: #A78BFA; border-bottom-color: #A78BFA; }
  .tab-icon { font-size: 1rem; }

  /* MAIN */
  .monitor-main { flex: 1; padding: 1.75rem 2rem; max-width: 1000px; width: 100%; margin: 0 auto; }

  .panel { display: flex; flex-direction: column; gap: 1.25rem; }
  .panel-title { font-size: 1.15rem; font-weight: 600; color: #e8eaf6; }
  .panel-sub { font-size: 0.82rem; color: #6b7290; line-height: 1.5; }

  /* DISPONIBILIDAD */
  .grid-wrap { overflow-x: auto; }
  .time-grid {
    display: grid;
    grid-template-columns: 56px repeat(6, 1fr);
    gap: 3px;
    min-width: 500px;
  }
  .grid-corner { background: transparent; }
  .grid-dia {
    background: #1a1f3c; border-radius: 6px;
    text-align: center; padding: 6px 2px;
    font-size: 0.72rem; font-weight: 600; color: #7c83b0;
    text-transform: uppercase; letter-spacing: .08em;
  }
  .grid-hora {
    display: flex; align-items: center; justify-content: flex-end;
    padding-right: 8px; font-size: 0.7rem; color: #4a4f72;
    font-family: 'JetBrains Mono', monospace;
  }
  .slot {
    height: 32px; border-radius: 5px; border: 1px solid #1f2340;
    cursor: pointer; transition: background .15s, transform .1s;
  }
  .slot.off { background: #141728; }
  .slot.on { background: linear-gradient(135deg, #6C63FF, #A78BFA); border-color: #6C63FF; }
  .slot:hover { transform: scale(1.05); }
  .legend { display: flex; align-items: center; gap: .4rem; font-size: 0.78rem; color: #6b7290; }
  .dot { display: inline-block; width: 12px; height: 12px; border-radius: 3px; }
  .dot.on { background: linear-gradient(135deg, #6C63FF, #A78BFA); }
  .dot.off { background: #141728; border: 1px solid #2a2f52; }

  .btn-primary {
    background: linear-gradient(135deg, #6C63FF, #A78BFA);
    color: #fff; border: none; border-radius: 10px;
    padding: 0.65rem 1.4rem; font-family: 'Sora', sans-serif;
    font-size: 0.85rem; font-weight: 600; cursor: pointer;
    align-self: flex-start; transition: opacity .2s, transform .1s;
  }
  .btn-primary:hover { opacity: .9; transform: translateY(-1px); }
  .btn-primary.small { padding: 0.45rem 0.9rem; font-size: 0.78rem; }
  .btn-outline {
    background: transparent; color: #A78BFA;
    border: 1px solid #3a3f6c; border-radius: 10px;
    padding: 0.45rem 0.9rem; font-family: 'Sora', sans-serif;
    font-size: 0.78rem; font-weight: 500; cursor: pointer;
    transition: background .15s;
  }
  .btn-outline:hover { background: #1a1f3c; }
  .success-msg { color: #43D9AD; font-size: 0.82rem; font-weight: 500; }

  /* MATERIAS */
  .materias-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1rem; }
  .materia-card {
    background: #141728; border-radius: 14px;
    border: 1px solid #1f2340; overflow: hidden;
    transition: transform .2s, border-color .2s;
  }
  .materia-card:hover { transform: translateY(-3px); border-color: var(--mc); }
  .mc-bar { height: 4px; background: var(--mc); }
  .mc-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; }
  .mc-codigo { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: #7c83b0; }
  .mc-nombre { font-size: 0.92rem; font-weight: 600; color: #e8eaf6; line-height: 1.3; }
  .mc-footer { display: flex; align-items: center; justify-content: space-between; margin-top: .25rem; }
  .mc-est { font-size: 0.75rem; color: #7c83b0; }
  .mc-badge { font-size: 0.68rem; background: #1a2a20; color: #43D9AD; border-radius: 6px; padding: 2px 8px; font-weight: 600; }

  /* SESIONES */
  .hoy-badge {
    background: #1a1f3c; border: 1px solid #6C63FF; border-radius: 10px;
    padding: .6rem 1rem; font-size: 0.82rem; color: #A78BFA; font-weight: 500;
    align-self: flex-start;
  }
  .sesiones-list { display: flex; flex-direction: column; gap: .75rem; }
  .sesion-row {
    background: #141728; border: 1px solid #1f2340; border-radius: 12px;
    padding: 1rem 1.25rem; display: flex; align-items: center;
    justify-content: space-between; gap: 1rem; flex-wrap: wrap;
    transition: border-color .2s;
  }
  .sesion-row:hover { border-color: #3a3f6c; }
  .sesion-left { display: flex; align-items: flex-start; gap: .75rem; }
  .sesion-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: #6C63FF; margin-top: 4px; flex-shrink: 0;
  }
  .sesion-dot.done { background: #43D9AD; }
  .sesion-dot.cancel { background: #ff6b6b; }
  .sesion-dot.parcial { background: #FFB347; }
  .sesion-mat { font-size: 0.9rem; font-weight: 600; color: #e8eaf6; }
  .sesion-meta { font-size: 0.78rem; color: #7c83b0; margin-top: 2px; }
  .sesion-fecha { font-size: 0.73rem; color: #4a4f72; margin-top: 1px; font-family: 'JetBrains Mono', monospace; }
  .sesion-notas { font-size: 0.75rem; color: #6b7290; margin-top: 4px; font-style: italic; max-width: 400px; }
  .sesion-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
  .sesion-right { flex-shrink: 0; }
  .empty { color: #4a4f72; font-size: 0.85rem; text-align: center; padding: 2rem; }

  /* HISTORIAL */
  .hist-stats { display: flex; gap: 1.5rem; }
  .hst { display: flex; flex-direction: column; align-items: center; background: #141728; border-radius: 12px; padding: .75rem 1.5rem; border: 1px solid #1f2340; }
  .hst-val { font-size: 1.5rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .hst-val.exitosa { color: #43D9AD; }
  .hst-val.parcial { color: #FFB347; }
  .hst-val.cancelada { color: #ff6b6b; }
  .hst-l { font-size: 0.72rem; color: #6b7290; text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

  .badge-res {
    font-size: 0.72rem; font-weight: 600; border-radius: 8px; padding: 3px 10px;
    text-transform: capitalize;
  }
  .badge-res.exitosa { background: #0d2a1e; color: #43D9AD; }
  .badge-res.parcial { background: #2a1f0a; color: #FFB347; }
  .badge-res.cancelada { background: #2a0f0f; color: #ff6b6b; }

  /* MODALS */
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 1rem;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: #141728; border: 1px solid #2a2f52; border-radius: 18px;
    padding: 1.75rem; width: 100%; max-width: 440px;
    display: flex; flex-direction: column; gap: 1rem;
    box-shadow: 0 20px 60px rgba(0,0,0,.5);
  }
  .modal-title { font-size: 1.05rem; font-weight: 600; color: #fff; }
  .modal-row { display: flex; justify-content: space-between; font-size: 0.85rem; border-bottom: 1px solid #1f2340; padding-bottom: .65rem; }
  .ml { color: #7c83b0; }
  .modal-btns { display: flex; gap: .75rem; margin-top: .5rem; }
  .modal-btns .btn-primary, .modal-btns .btn-outline { flex: 1; text-align: center; }

  .field { display: flex; flex-direction: column; gap: .4rem; }
  .field label { font-size: 0.78rem; color: #7c83b0; font-weight: 500; }
  .field input, .field select, .field textarea {
    background: #0d0f1a; border: 1px solid #2a2f52; border-radius: 8px;
    padding: .6rem .75rem; color: #e8eaf6; font-family: 'Sora', sans-serif; font-size: 0.85rem;
    transition: border-color .15s;
  }
  .field input:focus, .field select:focus, .field textarea:focus { outline: none; border-color: #6C63FF; }
  .field textarea { resize: vertical; min-height: 80px; }
  .field select option { background: #141728; }

  @media (max-width: 600px) {
    .monitor-main { padding: 1.25rem 1rem; }
    .sesion-row { flex-direction: column; align-items: flex-start; }
    .header-stats { display: none; }
    .hist-stats { flex-wrap: wrap; }
  }
</style>