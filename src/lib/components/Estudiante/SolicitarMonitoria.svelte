<script>
  import { onMount } from "svelte";
  import { API } from '$lib/services/api';


  let { idEstudiante, limiteMonitorias = 3, onExito } = $props();


  // ── Paso actual: 1 = materia, 2 = monitor, 3 = horario ──
  let paso = $state(1);

  // Selecciones
  let materiaSeleccionada = $state(null);   // { id, nombre }
  let monitorSeleccionado = $state(null);   // { id, nombre, apellido }
  let slotSeleccionado    = $state(null);   // { dia, hora_inicio }

  // Listas
  let materias    = $state([]);
  let monitores   = $state([]);
  let slots       = $state([]);      // disponibilidad del monitor

  let cargando    = $state(false);
  let error       = $state("");
  let enviando    = $state(false);
  let monitoriasCurso = $state(0);   // cuántas ya tiene el estudiante activas

  onMount(async () => {
    try {
      cargando = true;
      const [resMat, resCont] = await Promise.all([
        fetch(`${API}/materias/disponibles`),
        fetch(`${API}/monitorias/conteo/${idEstudiante}`),
      ]);
      if (resMat.ok)  materias       = await resMat.json();
      if (resCont.ok) monitoriasCurso = (await resCont.json()).total ?? 0;
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  });

  async function seleccionarMateria(m) {
    materiaSeleccionada = m;
    monitorSeleccionado = null;
    slotSeleccionado    = null;
    monitores = [];
    slots     = [];
    try {
      cargando = true;
      const res = await fetch(`${API}/monitores/por_materia/${m.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      monitores = await res.json();
      // Espera: [{ id, nombre, apellido, promedio_calificacion }]
      paso = 2;
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  }

  async function seleccionarMonitor(mon) {
    monitorSeleccionado = mon;
    slotSeleccionado    = null;
    slots = [];
    try {
      cargando = true;
      const res = await fetch(`${API}/disponibilidad/get_disponibilidad/${mon.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      slots = await res.json();
      // Espera: [{ dia, hora_inicio }]
      paso = 3;
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  }

  async function enviarSolicitud() {
    if (!slotSeleccionado) return;
    enviando = true; error = "";
    try {
      const body = {
        id_estudiante: idEstudiante,
        id_monitor:    monitorSeleccionado.id,
        id_materia:    materiaSeleccionada.id,
        dia:           slotSeleccionado.dia,
        hora_inicio:   slotSeleccionado.hora_inicio,
      };
      const res = await fetch(`${API}/monitorias/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onExito?.();
    } catch (e) { error = e.message; }
    finally { enviando = false; }
  }

  // Agrupar slots por día para mostrarlos organizados
  const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  let slotsPorDia = $derived(
    DIAS.reduce((acc, dia) => {
      const horas = slots.filter(s => s.dia === dia).map(s => s.hora_inicio).sort();
      if (horas.length) acc[dia] = horas;
      return acc;
    }, {})
  );

  let limitAlcanzado = $derived(monitoriasCurso >= limiteMonitorias);

  const pasos = [
    { n: 1, label: "Materia"  },
    { n: 2, label: "Monitor"  },
    { n: 3, label: "Horario"  },
  ];
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h2 class="section-title">Solicitar monitoría</h2>
      <p class="section-sub">Completa los 3 pasos para agendar tu sesión</p>
    </div>
    <div class="cupo-info">
      <span class="cupo-label">Monitorías activas</span>
      <div class="cupo-bar-wrap">
        <div class="cupo-bar" style="width:{(monitoriasCurso/limiteMonitorias)*100}%"></div>
      </div>
      <span class="cupo-num {limitAlcanzado ? 'lleno' : ''}">{monitoriasCurso}/{limiteMonitorias}</span>
    </div>
  </div>

  {#if error}
    <div class="alert alert-danger">{error}<button class="alert-close" onclick={() => error=""}>✕</button></div>
  {/if}

  {#if limitAlcanzado}
    <div class="alert alert-warning">
      <i class="bi bi-exclamation-triangle"></i>
      Has alcanzado el límite de {limiteMonitorias} monitorías activas. Espera a que finalice una antes de solicitar otra.
    </div>
  {:else}

    <!-- Stepper -->
    <div class="stepper">
      {#each pasos as p}
        <div class="step" class:done={paso > p.n} class:active={paso === p.n}>
          <div class="step-circle">
            {#if paso > p.n}
              <i class="bi bi-check"></i>
            {:else}
              {p.n}
            {/if}
          </div>
          <span class="step-label">{p.label}</span>
        </div>
        {#if p.n < pasos.length}
          <div class="step-line" class:done={paso > p.n}></div>
        {/if}
      {/each}
    </div>

    <!-- ── PASO 1: MATERIA ── -->
    {#if paso === 1}
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Selecciona una materia</h3>
        </div>
        {#if cargando}
          <div class="empty-state"><div class="spinner"></div></div>
        {:else if materias.length === 0}
          <div class="empty-state">No hay materias disponibles.</div>
        {:else}
          <ul class="lista">
            {#each materias as m}
              <li>
                <button
                  class="lista-item"
                  class:selected={materiaSeleccionada?.id === m.id}
                  onclick={() => seleccionarMateria(m)}
                >
                  <div class="lista-icon"><i class="bi bi-book-half"></i></div>
                  <div class="lista-info">
                    <span class="lista-nombre">{m.nombre}</span>
                    <span class="lista-sub">{m.monitores_disponibles ?? 0} monitores disponibles</span>
                  </div>
                  <i class="bi bi-chevron-right lista-arrow"></i>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <!-- ── PASO 2: MONITOR ── -->
    {#if paso === 2}
      <div class="card">
        <div class="card-header">
          <button class="btn-back" onclick={() => { paso = 1; monitorSeleccionado = null; }}>
            <i class="bi bi-arrow-left"></i> {materiaSeleccionada?.nombre}
          </button>
          <h3 class="card-title">Selecciona un monitor</h3>
        </div>
        {#if cargando}
          <div class="empty-state"><div class="spinner"></div></div>
        {:else if monitores.length === 0}
          <div class="empty-state">No hay monitores disponibles para esta materia.</div>
        {:else}
          <ul class="lista">
            {#each monitores as mon}
              <li>
                <button
                  class="lista-item"
                  class:selected={monitorSeleccionado?.id === mon.id}
                  onclick={() => seleccionarMonitor(mon)}
                >
                  <div class="avatar-sm">{mon.nombre[0]}{mon.apellido[0]}</div>
                  <div class="lista-info">
                    <span class="lista-nombre">{mon.nombre} {mon.apellido}</span>
                    {#if mon.promedio_calificacion}
                      <span class="lista-sub">
                        <i class="bi bi-star-fill rating-star"></i>
                        {mon.promedio_calificacion.toFixed(1)}
                      </span>
                    {/if}
                  </div>
                  <i class="bi bi-chevron-right lista-arrow"></i>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <!-- ── PASO 3: HORARIO ── -->
    {#if paso === 3}
      <div class="card">
        <div class="card-header">
          <button class="btn-back" onclick={() => { paso = 2; slotSeleccionado = null; }}>
            <i class="bi bi-arrow-left"></i> {monitorSeleccionado?.nombre} {monitorSeleccionado?.apellido}
          </button>
          <h3 class="card-title">Elige un horario disponible</h3>
        </div>

        {#if cargando}
          <div class="empty-state"><div class="spinner"></div></div>
        {:else if slots.length === 0}
          <div class="empty-state">Este monitor no tiene horarios registrados.</div>
        {:else}
          <div class="horario-grid">
            {#each Object.entries(slotsPorDia) as [dia, horas]}
              <div class="dia-col">
                <div class="dia-header">{dia}</div>
                {#each horas as hora}
                  <button
                    class="slot"
                    class:active={slotSeleccionado?.dia === dia && slotSeleccionado?.hora_inicio === hora}
                    onclick={() => slotSeleccionado = { dia, hora_inicio: hora }}
                  >
                    {hora}
                  </button>
                {/each}
              </div>
            {/each}
          </div>

          <div class="confirm-bar">
            {#if slotSeleccionado}
              <span class="confirm-info">
                <i class="bi bi-calendar-check"></i>
                {slotSeleccionado.dia} a las {slotSeleccionado.hora_inicio}
              </span>
            {:else}
              <span class="confirm-placeholder">Selecciona un bloque horario</span>
            {/if}
            <button
              class="btn btn-primary"
              onclick={enviarSolicitud}
              disabled={!slotSeleccionado || enviando}
            >
              {enviando ? "Enviando…" : "Confirmar solicitud"}
            </button>
          </div>
        {/if}
      </div>
    {/if}

  {/if}
</div>

<style>
  .page { display: flex; flex-direction: column; gap: 1.25rem; }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .section-title { font-size: 16px; font-weight: 500; margin: 0 0 3px; }
  .section-sub   { font-size: 13px; color: #888; margin: 0; }

  /* Cupo */
  .cupo-info { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; }
  .cupo-label { white-space: nowrap; }
  .cupo-bar-wrap { width: 80px; height: 6px; background: rgba(0,0,0,0.08); border-radius: 3px; overflow: hidden; }
  .cupo-bar { height: 100%; background: #1D9E75; border-radius: 3px; transition: width .3s; }
  .cupo-num { font-weight: 600; color: #333; }
  .cupo-num.lleno { color: #A32D2D; }

  /* Alerts */
  .alert { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger  { background:#FCEBEB; color:#A32D2D; border:0.5px solid #F09595; justify-content:space-between; }
  .alert-warning { background:#FFF8E1; color:#7D5A00; border:0.5px solid #FFDD80; }
  .alert-close   { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; }

  /* Stepper */
  .stepper {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 1rem 1.25rem;
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 12px;
  }

  .step { display: flex; align-items: center; gap: 8px; }
  .step-circle {
    width: 26px; height: 26px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600;
    background: rgba(0,0,0,0.07);
    color: #aaa;
    flex-shrink: 0;
    transition: background .2s, color .2s;
  }
  .step.active .step-circle  { background: #010A55; color: #fff; }
  .step.done   .step-circle  { background: #1D9E75; color: #fff; }
  .step-label { font-size: 12px; color: #aaa; white-space: nowrap; }
  .step.active .step-label   { color: #010A55; font-weight: 500; }
  .step.done   .step-label   { color: #1D9E75; }
  .step-line { flex: 1; height: 1px; background: rgba(0,0,0,0.1); margin: 0 8px; min-width: 20px; }
  .step-line.done { background: #1D9E75; }

  /* Card */
  .card {
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    overflow: hidden;
  }

  .card-header { padding: 1rem 1.25rem .5rem; border-bottom: 0.5px solid rgba(0,0,0,0.06); }
  .card-title  { font-size: 14px; font-weight: 500; margin: 6px 0 0; }

  .btn-back {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    font-size: 12px;
    color: #888;
    cursor: pointer;
    padding: 0;
  }
  .btn-back:hover { color: #010A55; }

  /* Lista de selección */
  .lista { list-style: none; margin: 0; padding: .5rem 0; }
  .lista li + li { border-top: 0.5px solid rgba(0,0,0,0.05); }

  .lista-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 1.25rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background .12s;
  }
  .lista-item:hover    { background: #f5f5f3; }
  .lista-item.selected { background: #EEF0FF; }

  .lista-icon {
    width: 32px; height: 32px;
    border-radius: 7px;
    background: #EEF0FF;
    display: flex; align-items: center; justify-content: center;
    color: #010A55;
    font-size: 14px;
    flex-shrink: 0;
  }

  .avatar-sm {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: #1D9E75;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; color: #fff;
    flex-shrink: 0;
  }

  .lista-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .lista-nombre { font-size: 13px; font-weight: 500; color: #222; }
  .lista-sub    { font-size: 11px; color: #999; display: flex; align-items: center; gap: 4px; }
  .rating-star  { color: #F5A623; font-size: 10px; }
  .lista-arrow  { color: #ccc; font-size: 12px; }

  /* Horario grid */
  .horario-grid {
    display: flex;
    gap: 8px;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    flex-wrap: wrap;
  }

  .dia-col { display: flex; flex-direction: column; gap: 4px; min-width: 80px; }

  .dia-header {
    font-size: 11px;
    font-weight: 500;
    color: #888;
    text-align: center;
    padding: 4px 0;
  }

  .slot {
    padding: 6px 0;
    text-align: center;
    font-size: 12px;
    border-radius: 6px;
    border: 0.5px solid rgba(0,0,0,0.1);
    background: #f5f5f3;
    cursor: pointer;
    transition: background .12s, border-color .12s, color .12s;
    color: #555;
  }
  .slot:hover  { background: #C0DD97; border-color: #639922; color: #2a4400; }
  .slot.active { background: #010A55; border-color: #010A55; color: #fff; font-weight: 500; }

  /* Confirm bar */
  .confirm-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .75rem 1.25rem;
    border-top: 0.5px solid rgba(0,0,0,0.06);
    background: #fafafa;
  }

  .confirm-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #010A55;
  }

  .confirm-placeholder { font-size: 13px; color: #bbb; }

  /* Buttons */
  .btn          { height: 34px; padding: 0 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
  .btn-primary  { background: #010A55; color: #fff; }
  .btn-primary:hover { background: #020d6e; }
  .btn:disabled { opacity: .5; cursor: not-allowed; }

  /* Empty / spinner */
  .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:2.5rem; color:#aaa; font-size:13px; }
  .spinner { width:26px; height:26px; border:3px solid rgba(1,10,85,0.12); border-top-color:#010A55; border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>